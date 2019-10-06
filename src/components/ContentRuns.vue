<template>
    <v-container>
        <v-dialog v-model="dialog_logs" 
                  max-width="1000px"
                  persistent
                  transition=""
                  no-click-animation
                  scrollable
         >
            <v-card>
                <v-card-title>
                    <span class="headline">Run Logs</span>
                    <v-spacer></v-spacer>
                    <span>
                        <v-progress-circular v-if="loader_logs==true"
                                             indeterminate
                                             color="primary"
                         ></v-progress-circular>
                    </span>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text  style="height: 500px;">
                    <v-list>
                        <v-list-group  v-for="item in logs_items"
                                       :key="item.id"
                                       v-model="item.active"
                                       no-action >
                            <template v-slot:activator>
                                <v-list-item>
                                    <v-list-item-action>
                                        <v-chip :color="getRunColor(item.action)"
                                                small 
                                                text-color="white"
                                          >{{ item.action }}</v-chip>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <span class="font-weight-bold body-2">{{ item.title }}</span>
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </template>
                            <v-list-item v-for="subItem in item.items"
                                        :key="subItem.title"
                             >
                                <v-list-item-content>
                                    <v-list-item-title>
                                        <span class="black--text font-italic caption    ">{{ subItem.timestamp }}</span>
                                        <span class="grey--text" v-if="subItem.level == 'info'" > {{ subItem.title }}</span>
                                        <span class="red--text" v-if="subItem.level == 'error'" > {{ subItem.title }}</span>
                                        <span class="orange--text" v-if="subItem.level == 'warning'" > {{ subItem.title }}</span>
                                    </v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-icon>{{ subItem.action }}</v-icon>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list-group>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1"
                           text
                           @click="close_dialog_logs">Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-card>
            <v-card-title>
                <v-select
                    v-model="project_select"
                    :items="projects_list"
                    label="Project"
                    prepend-icon="dashboard"
                    @input="onProjectChanged"
                ></v-select>
                <v-spacer></v-spacer>
                <v-btn  
                    icon 
                    @click="onManualRefresh">
                    <v-icon>refresh</v-icon>
                </v-btn>
                <v-select
                    v-model="refresh_select"
                    :items="refresh_list"
                    @input="onRefreshChanged"
                ></v-select>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-data-table v-model="selected"
                              :headers="headers"
                              :items="datamodel"
                              :items-per-page="10"
                              :loading="loader_table"
                              loading-text="Loading... Please wait"
                              show-select >
                    <template v-slot:item.durationhuman="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item.durationhuman }}</v-chip>
                    </template>
                    <template v-slot:item.script="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item.script }}</v-chip>
                    </template>
                    <template v-slot:item.state="{ item }">
                        <v-chip
                            small
                            :color="getRunColor(item.state)"
                            dark>  {{ item.state }}
                        </v-chip>
                    </template>
                    <template v-slot:item.logs="{ item }">
                        <v-btn text
                            icon class="mx-0"
                            @click="getRunLogs(item)" 
                            :loading="item.loader">
                            <v-icon >view_list</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
                <div>
                    <v-btn 
                        v-if="selected.length != 0"
                        dark
                        color="red"
                        @click="deleteRuns" >
                        Remove selected runs
                    </v-btn>
                </div>
            </v-card-text>
        </v-card> 
    </v-container>
</template>

<script>
  import moment from 'moment'
  import { BackendApi } from '@/backend.js'

  export default {
    data() {
        return {
            selected: [],
            dialog_logs: false,
            polling: null,
            refresh_select: 5000,
            refresh_list: [ {"text": "Refresh disabled", "value": 0 },
                              {"text": "Refresh every 5s", "value": 5000 }, 
                              {"text": "Refresh every 10s", "value": 10000 },
                              {"text": "Refresh every 1min", "value": 60000 }  ],
            headers: [
                    { text: 'Date', align: 'left', value: 'datetime' },
                    { text: 'Script', align: 'left', value: 'script' },
                    { text: 'Duration', align: 'left', value: 'durationhuman' },
                    { text: 'User', align: 'left', value: 'user' },
                    { text: 'State', align: 'left', value: 'state' },
                    { text: 'Logs', align: 'left', value: 'logs' }
                ],
             loader_table: false,
             datamodel: [],
             project_select: 1,
             projects_list: [ {"text": "Common", "value": 1} ],
             logs_items: [],
             logs_index: 0,
             log_current: null,
             loader_logs: false
        }
    },   
    beforeDestroy () {
        // disable the automatic refresh when we leave the page
        clearInterval(this.polling)
    },
    async created () {
      // retrieve user from local storage
      const user =  localStorage.getItem('user_session');
      const user_json =  JSON.parse(user)

      // enable the progress bar
      this.loader_table = true

      // get projects according to the user
      var prjs_granted_list = await BackendApi.getProjectsGranted(user_json)

      for (var i = 0; i < prjs_granted_list.length; ++i) {
        this.projects_list.push(
                  {
                    "text": prjs_granted_list[i]["name"], 
                    "value": prjs_granted_list[i]["id"] 
                    } 
                  )
      }

     // retrieve results
     this.getRunsListing(this.project_select)

     // automatic refresh to get tasks ?
      if (this.refresh_select > 0 ){
        this.pollData()
      }

      // disable the progress bar
      this.loader_table = false
    },
    methods: {
        // get run logs according to the item selected
        async getRunLogs(item){
            //activate the loader of the item
            item.loader=true

            // active the loader of the dialog
            this.loader_logs = true

            // reset logs items
            this.logs_items = []
            this.logs_index = 0
            this.log_current = null

            //call to the server to get details
            await this.getRunDetails(item.id)

            // disable the loader
            item.loader=false

            // show the form
            this.dialog_logs = true
        },

        // get run details from server
        async getRunDetails(id){
            await BackendApi.runDetails(id, this.project_select, this.logs_index).then(resp => {
                if ( resp != undefined) {
                    this.logs_index = resp["test-logs-index"]
                    var logs = resp["test-logs"].split("\n")
                    for (var i = 0; i < logs.length; ++i) {
                        const [timestamp, action] = logs[i].split(" ", 2)
                        const endline = logs[i].split(" ").slice(2).join(" ")
                        if ( action == "task-started") {
                            this.log_current = {
                                                    id: i,
                                                    action: 'TASK STARTED',
                                                    title: '',
                                                    items: [],
                                                    active: false
                                                } 
                            this.logs_items.push(this.log_current)
                        }
                        if ( action == "task-stopped") {
                            this.log_current = {
                                                    id: i,
                                                    action: 'TASK STOPPED',
                                                    title: '',
                                                    items: [],
                                                    active: false
                                                } 
                            this.logs_items.push(this.log_current)
                        }
                        if ( action == "script-started") {
                            this.log_current = {
                                                    id: i,
                                                    action: 'RUNNING',
                                                    title: endline,
                                                    items: [],
                                                    active: false
                                                } 
                            this.logs_items.push(this.log_current)
                        }
                        if ( action == "script-info") {
                            this.log_current.items.push( { title: endline,
                                                   timestamp: timestamp,
                                                   level: "info"} )
                        }
                        if ( action == "script-warning") {
                            this.log_current.items.push( { title: endline,
                                                   timestamp: timestamp,
                                                   level: "warning"} )
                        }
                        if ( action == "script-error") {
                            this.log_current.items.push( { title: endline,
                                                    timestamp: timestamp,
                                                    level: "error"} )
                        }
                        if ( action == "script-stopped") {
                            const [, , result, ] = logs[i].split(" ")
                            this.log_current.action = result
                        }
                    }

                    if (resp["test-verdict"] == null){
                        setTimeout(() => { this.getRunDetails(id) }, 5000)
                    } else {
                        // disable the loader, no more data to get from server
                        this.loader_logs = false
                    }
                }
            })

        },

        // delete only selected and terminated runs 
        deleteRuns(){
            for (var i = 0; i < this.selected.length; ++i) {
                if (this.selected[i]["state"] != "RUNNING") {
                    this.deleteRun(this.selected[i]["id"])
                } else {
                    this.selected.splice(i, 1);
                }
            }

            // reset selected items
            this.selected = []
        },

        // delete a specific run according to the id provided
        deleteRun(id){
            BackendApi.deleteRun(id, this.project_select).then(resp => {
                if ( resp != undefined) {
                    this.getRunsListing(this.project_select)
                }
            })
        },

        // called on manuel refresh for the runs listing
        onManualRefresh(){
            this.getRunsListing(this.project_select)
        },

        // get a listing of all runs 
        getRunsListing(projectid){
            // enable the progress bar
            this.loader_table = true

            BackendApi.getRunsListing(projectid).then(resp => {
                if ( resp != undefined) {

                    for (var i = 0; i < resp["listing"].length; ++i) {
                        resp["listing"][i]["loader"] = false

                        var human_duration = '...'
                        if (resp["listing"][i]['duration'] > 0) {
                            human_duration = moment.duration( resp["listing"][i]['duration'] , "seconds").humanize()
                        }
                        resp["listing"][i].durationhuman = human_duration
                    }

                    this.datamodel = resp.listing
                }
            })

            // disable the progress bar
            this.loader_table = false
        },

        // called when the project is changed from the select
        onProjectChanged(){
          // reload runs according to the selected project
          this.getRunsListing( this.project_select )
        },

        // called when the automatic refresh is activated
        onRefreshChanged(){
          // stop the refresh
          clearInterval(this.polling)

          // restart the interval
          if (this.refresh_select > 0 ){
             this.pollData()
          }
        },

        // automatic refresh of the runs listing every xx seconds
        pollData () {
          this.polling = setInterval(() => {
              this.getRunsListing(this.project_select)
          }, this.refresh_select )
        },

        // return color according item state
        getRunColor(state){
            if (state == 'PASS'){
                return "green"
            } else if (state == 'FAIL'){
                return "red"
            } else if (state == 'UNDEFINED'){
                return "orange"
            } else if (state == 'RUNNING'){
                return "blue"
            } else {
                return "grey"
            }
        },

        // hide the dialog for logs
        close_dialog_logs(){
            this.dialog_logs = false
        }
    }
  }
</script>