<template>
    <v-container>
        <v-dialog  
            v-model="dialog" 
            max-width="900px"
            persistent
            transition=""
            no-click-animation
            scrollable 
        >
            <v-card >
                <v-card-title>
                    <span class="headline">Job</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-stepper v-model="e1" style="height: 500px;" >
                    <v-stepper-header>
                        <v-stepper-step step="1"  editable >Select your file</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="2" editable>Schedule your job</v-stepper-step>    
                    </v-stepper-header>
                    <v-stepper-items>
                        <v-stepper-content step="1"  >
                            <v-select
                                v-model="project_select"
                                :items="projects_list"
                                label="Workspace"
                                prepend-icon="dashboard"
                                @input="onProjectChanged"
                            ></v-select>
                            <v-breadcrumbs :items="script_nav">
                                <template v-slot:item="props">
                                    <a @click="onClickNav(props.item.id)" >{{props.item.text}}</a>
                                </template>
                            </v-breadcrumbs>
                            <v-list subheader>
                                <v-list-item
                                    v-for="item in items_list"
                                    :key="item.title" 
                                    @click="onClickFolder(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon >{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-list-item
                                    v-for="item in items2_list"
                                    :key="item.id"
                                    @click="onClickFile(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-stepper-content>
                        <v-stepper-content step="2">
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Project</v-subheader>
                                </v-flex>
                                <v-flex xs8>

                                        <v-select
                                            v-model="project_select"
                                            :items="projects_list"
                                            readonly
                                        ></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Script</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-text-field
                                        :value="selected_script_path + selected_script.name"
                                        readonly
                                        ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Run Mode</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-radio-group v-model="runmode" row>
                                        <v-radio label="Now" value="0"></v-radio>
                                        <v-radio label="At" value="1"></v-radio>
                                        <v-radio label="Every" value="7"></v-radio>
                                        <v-radio label="Hourly" value="5"></v-radio>
                                        <v-radio label="Daily" value="6"></v-radio>
                                        <v-radio label="Weekly" value="8"></v-radio>      
                                    </v-radio-group>
                                </v-flex>
                            </v-layout>
                             <v-layout row>
                                <v-flex xs4>
                                </v-flex>
                                <v-flex xs8>
                                        <v-layout align-center>
                                                <v-text-field 
                                                    v-if="runmode == '7'"
                                                    v-model="every_hour" 
                                                    mask="##" 
                                                    prepend-icon="timelapse"
                                                    label="Hour(s)">
                                                </v-text-field>
                                                <v-text-field 
                                                    v-if="runmode == '5' || runmode == '7'"
                                                    v-model="every_min" 
                                                    mask="##" 
                                                    prepend-icon="timelapse"
                                                    :rules="rule_minute"
                                                    label="Minute(s)">
                                                </v-text-field>
                                                <v-select
                                                    v-if="runmode == '8'"
                                                    v-model="day_selected"
                                                    :items="items_day"
                                                    prepend-icon="calendar_today"
                                                    label="Day"
                                                ></v-select>
                                                <v-menu
                                                    v-if="runmode == '1'"
                                                    ref="menu1"
                                                    v-model="menu1"
                                                    :close-on-content-click="false"
                                                    :nudge-right="40"
                                                    transition="scale-transition"
                                                    offset-y
                                                    max-width="290px"
                                                    min-width="290px"
                                                    >
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field
                                                        v-model="dateFormatted"
                                                        label="Date"
                                                        readonly
                                                        persistent-hint
                                                        prepend-icon="event"
                                                        
                                                        v-on="on"
                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
                                                    </v-menu>
                                                    <v-menu
                                                        ref="menu"
                                                        v-if="runmode == '1' || runmode == '6' || runmode == '8'"
                                                        v-model="menu2"
                                                        :close-on-content-click="false"
                                                        :nudge-right="40"
                                                        :return-value.sync="time"
                                                        transition="scale-transition"
                                                        offset-y
                                                        max-width="290px"
                                                        min-width="290px"
                                                    >
                                                        <template v-slot:activator="{ on }">
                                                        <v-text-field
                                                            v-model="time"
                                                            label="Time"
                                                            prepend-icon="access_time"
                                                            readonly
                                                            v-on="on"
                                                        ></v-text-field>
                                                        </template>
                                                        <v-time-picker
                                                            v-if="menu2"
                                                            v-model="time"
                                                            @click:minute="$refs.menu.save(time)"
                                                        ></v-time-picker>
                                                    </v-menu>
                                                    
                                                </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text 
                            @click="scheduleTask"
                            :loading="loader_dialog"
                            >CREATE</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
         <v-layout >
              <v-flex  >
        <v-card>
          <v-card-title>
            <v-btn color="green" dark class="mb-2" @click="addTask">SCHEDULE JOB</v-btn>           
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn  
                icon 
                @click="getTasksListing">
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
            <v-container fluid>
            <v-layout row>
             <v-flex>
                <v-data-table :headers="headers"
                              :items="datamodel"
                              :items-per-page="10"
                              :search="search"
                              :loading="loader_table"
                  >
                    <template v-slot:item.runmode="{ item }">
                        <v-chip color="grey" small text-color="white">{{getTaskMode(item)}}</v-chip>
                    </template>

                    <template v-slot:item.script="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item["project-name"] }} : {{ item.name }}</v-chip>
                    </template>

                    <template v-slot:item.state="{ item }">
                        <v-speed-dial
                            direction="left"
                            >
                            <template v-slot:activator>
                                <v-btn
                                    rounded
                                    :color="getTaskColor(item.state)"
                                    dark 
                                    small>
                                    {{item.state }}
                                </v-btn>
                            </template>
                            <v-btn v-if="item.state == 'WAITING'" 
                                dark
                                small
                                rounded
                                color="black"
                                @click="cancelTask(item.id)" >
                                Cancel
                            </v-btn>
                            <v-btn v-if="item.state == 'RUNNING'" 
                                dark
                                small
                                rounded
                                color="red"
                                @click="killTask(item.id)" >
                                Kill
                            </v-btn>
                        </v-speed-dial>
                    </template>
                </v-data-table>
            </v-flex>
            </v-layout>
              </v-container>
          </v-card-text>
        </v-card> 
        </v-flex>
        </v-layout>
        </v-container>
</template>

<script>
  import moment from 'moment'
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
      data() {
          return {
              polling: null,
              refresh_select: 5000,
              refresh_list: [ {"text": "Refresh disabled", "value": 0 },
                              {"text": "Refresh every 5s", "value": 5000 }, 
                              {"text": "Refresh every 10s", "value": 10000 },
                              {"text": "Refresh every 1min", "value": 60000 }  ],
              datamodel: [],
              dataprojects: [],
              headers: [
                    { text: 'Id', align: 'left', value: 'id' },
                    { text: 'Run mode', align: 'left', value: 'runmode' },
                    { text: 'Script', align: 'left', value: 'script' },
                    { text: 'User', align: 'left', value: 'user' },
                    { text: '', align: 'left', value: 'state'}
                ],
             search: '',
             loader_table: false,
             loader_dialog: false,
             editedItem: {},
             dialog: false,
             project_select: 1,
             projects_list: [ {"text": "Common", "value": 1} ],
             items_list: [],
            items2_list: [],
            script_listing: [],
            script_nav: [  {text: 'Root', id: "00"} ],
            e1: 0,
            selected_script: {},
            selected_script_path: '',
            runmode: "0",
            menu1: false,
            date: new Date().toISOString().substr(0, 10),
            dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
            menu2: false,
            modal2: false,
            time: new Date().getHours() + ":" + new Date().getMinutes(),
            items_day: [ { text: 'Monday', value: 0}, 
                         { text: 'Tuesday', value:1}, 
                         { text: 'Wednesday', value:2}, 
                         { text: 'Thursday', value:3},
                         { text: 'Friday', value: 4 }, 
                         { text: 'Saturday', value:5}, 
                         { text: 'Sunday', value: 6 } ],
            day_selected: { text: 'Monday', value: 0 },
            every_min: '',
            every_hour: '',
            rule_minute: [ v => v >0 && v < 60 || 'Exceed time interval' ]
          }
      },
      watch: {
        date (val) {
            this.dateFormatted = this.formatDate(val)
        }
      },
      methods: {
        onProjectChanged(){
            // reset the tr,ee
            this.items_list = []
            this.items2_list = []
            this.script_nav =[  {text: 'Root', id: "00"} ]

            // and reload
            this.getScriptsListing()
        },
        closeDialog(){
            this.dialog = false
        },
        async scheduleTask(){
            // enable progress
            this.loader_dialog = true

            if ( !this.selected_script_path.length  ){
                EventBus.$emit('AppWarning', "No script selected"); 
                // disable progress
                this.loader_dialog = false
                return;  
            }

            // get all parameters to schedule the task
            var testprjid = this.project_select
            var testname = this.selected_script.name
            var testext = this.selected_script.extension
            var testpath = this.selected_script_path
            if (testpath == "/") { testpath = ""}
            var schedid = parseInt(this.runmode)
            var repeat = -1
            var y = 0; var m = 0; var d = 0 
            var h = 0; var mn = 0; var s = 0

            // now
            if ( schedid == 0) {
                repeat = 0
            }

            // schedule at
            if ( schedid == 1) {
                const [ year, month, day ] = this.date.split('-')
                y = parseInt(year); m = parseInt(month); d = parseInt(day)
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)
            }

            // daily
            if ( schedid == 6) {
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)
            }

            // weekly
            if ( schedid == 8) {
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)

               d = this.day_selected
            }

            // hourly
            if ( schedid == 5) {
                if ( this.every_min.length > 0) {
                    mn = parseInt( this.every_min )
                }
            }

            // every
            if ( schedid == 7) {
                if ( this.every_min.length > 0) {
                    mn = parseInt( this.every_min )
                }
                if ( this.every_hour.length > 0) {
                    h = parseInt( this.every_hour )
                }
            }

            // schedule the task on server side
            if (testext == "yml"){
                await BackendApi.scheduleJob(testprjid, testname, testext, testpath, 
                                             schedid, repeat,
                                            y, m, d, h, mn, s)
            } else {
                await BackendApi.scheduleTask(testprjid, testname, testext, testpath, 
                                            schedid, repeat,
                                            y, m, d, h, mn, s)
            }

            // refresh tasks listing
            this.getTasksListing()

            // disable progress
            this.loader_dialog = false

            // close the dialog
            this.dialog = false

        },
        getTaskMode(item){
            const [ y, m, d, h, mn ] = item["sched-args"]
            var d_str = ''
            for (var i = 0; i < this.items_day.length; ++i) {
                if (this.items_day[i].value == d){
                    d_str = this.items_day[i].text
                    break
                }
            }

            if ( item["sched-id"] == 0 ){
                return 'Now'
            }
            if ( item["sched-id"] == 1 ){
                return 'On ' + y + '/' + m + '/' + d + ' at ' + h + ':' + mn
            }
            if ( item["sched-id"] == 6 ){
                return 'Every day at ' + h + ':' + mn
            }
            if ( item["sched-id"] == 5 ){
                return 'Every hour at ' + mn + ' minute(s)'
            }
            if ( item["sched-id"] == 8 ){
                return 'Every ' + d_str + ' at ' + h + ':' + mn
            }
            if ( item["sched-id"] == 7 ){
                return 'Every ' + h + ' hour(s) and ' +  mn + ' minute(s)'
            }
        },
        getTaskColor(state){
            if (state == 'RUNNING'){
                return "blue"
            } else if (state == 'WAITING'){
                return "grey"
            } else {
                return "black"
            }
        },
        addTask(){
          // reset stepper and some parameters
          this.e1 = 1
          this.selected_script_path = ''
          this.selected_script = { name: ''}

          // show the form
          this.dialog = true
        },
        replayTask(id){
            BackendApi.replayTask(id).then(resp => {
                if ( resp != undefined) {
                    this.getTasksListing()
                }
            })
        },
        cancelTask(id){
            BackendApi.cancelTask(id).then(resp => {
                if ( resp != undefined) {
                    this.getTasksListing()
                }
            })
        },
        killTask(id){
            BackendApi.killTask(id).then(resp => {
                if ( resp != undefined) {
                    this.getTasksListing()
                }
            })
        },
        removeTask(id){
            BackendApi.removeTask(id).then(resp => {
                if ( resp != undefined) {
                    this.getTasksListing()
                }
            })
        },
        onClickFile(id){
            // move the stepper to next step
            this.e1 = 2

            //save the current item 
            this.selected_script = this.script_listing[id]

            // construct the path of the script
            var path_tmp_list = []
            var item_tmp = this.script_listing[id]
            while( item_tmp["parent-id"] != "00"){
                if (item_tmp.type == "folder") {
                    path_tmp_list.push( item_tmp.name )
                } 
                item_tmp = this.script_listing[item_tmp["parent-id"]]
            }
            if (item_tmp.type == "folder") {
                path_tmp_list.push( item_tmp.name )
            } 
            path_tmp_list = path_tmp_list.reverse()

            // conver path to string
            var path_str = "/"
            for (var i = 0; i < path_tmp_list.length; ++i) {
                path_str += path_tmp_list[i]
                path_str += "/"
            }
            this.selected_script_path = path_str
        },
        onClickNav(id){
            // clear the navigation menu of the tree
            var new_nav = []
            for (var i = 0; i < this.script_nav.length; ++i) {
                if ( this.script_nav[i].id != id ){
                    new_nav.push( this.script_nav[i] )
                } else {
                    break
                }
            }

            // apply the new navigation menu
            this.script_nav = new_nav

            // reload the tree
            this.onClickFolder(id)
        },
        onClickFolder(id){
            // clear the tree (folders and files)
            this.items_list = []
            this.items2_list = []

            // update the navigation menu of the tree
            this.script_nav.push( {text: this.script_listing[id].name, id: id}  )

            // load the tree
            for (var key in this.script_listing){
                if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "folder" ) {
                    this.items_list.push( { icon: "folder",
                                            title: this.script_listing[key].name, 
                                            id: key } )
                }

                if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "file" ) {
                    this.items2_list.push( { icon: "description",
                                            title: this.script_listing[key].name, 
                                            id: key } )
                }
            }
        },
        getScriptsListing(){
            BackendApi.getScriptsListing(this.project_select).then(resp => {
                if ( resp != undefined) {
                    this.script_listing = resp.listing
                    this.script_listing["00"] = {"name": "Root", "type": "root"}
                    for (var key in this.script_listing){
                        if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "folder" ) {
                            this.items_list.push( { icon: "folder",
                                                    title: this.script_listing[key].name, 
                                                    id: key } )
                        }

                        if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "file" ) {
                            this.items2_list.push( { icon: "description",
                                                    title: this.script_listing[key].name, 
                                                    id: key } )
                        }
                    }
                }
            })
        },
        getTasksListing(){

            BackendApi.getTasksListing().then(resp => {
            
            
              if ( resp != undefined) {
                for (var i = 0; i < resp["tasks-listing"].length; ++i) {
                    // add project name according to the project id
                    for (var j = 0; j < this.dataprojects.length; ++j) {
                        if ( this.dataprojects[j].id == resp["tasks-listing"][i]["project-id"] ) {
                            resp["tasks-listing"][i]["project-name"] = this.dataprojects[j].name
                        }
                    }

                    if ( resp["tasks-listing"][i]['state'] == "WAITING" || resp["tasks-listing"][i]['state'] == "CANCELLED" ) {
                        resp["tasks-listing"][i]["created-at"] = ""
                        resp["tasks-listing"][i]["duration-human"] = ""
                    } else {
                        // convert timestamp to human form
                        var new_date = moment.unix(resp["tasks-listing"][i]['start-at']).format('YYYY-MM-DD [at] hh:mm:ss')
                        resp["tasks-listing"][i]["created-at"] = new_date

                        // convert duration to human form
                        var new_dur = moment.duration( resp["tasks-listing"][i]['duration'] , "seconds").humanize(); 
                        resp["tasks-listing"][i]["duration-human"] = new_dur
                    }
                }
                this.test  = resp["tasks-listing"].reverse()
                this.datamodel = resp["tasks-listing"]
              }

            })
        },
        pollData () {
          this.polling = setInterval(() => {
              this.getTasksListing()
          }, this.refresh_select )
        },
        onRefreshChanged(){
          // stop the refresh
          clearInterval(this.polling)

          // restart the interval
          if (this.refresh_select > 0 ){
             this.pollData()
          }
        },
        formatDate (date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}/${day}/${year}`
        },
        allowedHours: v => v > 12
      },
      beforeDestroy () {
        // disable the automatic refresh
        clearInterval(this.polling)
      },

      async created () {
        // retrieve user from local storage
        const user =  localStorage.getItem('user_session');
        const user_json =  JSON.parse(user)
        
        
        // get projects according to the user, 
        // waiting response before to continue
        this.dataprojects = await BackendApi.getProjectsGranted(user_json)

        for (var i = 0; i < this.dataprojects.length; ++i) {
            this.projects_list.push(
                {
                    "text": this.dataprojects[i]["name"], 
                    "value": this.dataprojects[i]["id"] 
                    } 
                )
        }

        // retrieve all scripts
        this.getScriptsListing()

        // retrieve all tasks
        this.getTasksListing()

        // automatic refresh to get tasks ?
        if (this.refresh_select > 0 ){
         this.pollData()
        }
     },
     

  }
</script>

<style scoped>
.v-list {
  height: 250px;
  overflow-y: auto;
}
</style>