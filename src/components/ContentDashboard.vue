<template>
    <v-container fluid>
      <v-row dense>
        <v-col cols=6>
          <v-card > 
            <v-card-title>RUNNING</v-card-title>
            <v-card-text>
              <p class="display-1 text--primary">{{running}}</p>
            </v-card-text>
          </v-card>
         </v-col>
         <v-col cols=6>
           <v-card > 
            <v-card-title>SCHEDULED</v-card-title>
            <v-card-text>
              <p class="display-1 text--primary">{{scheduled}}</p>
            </v-card-text>
          </v-card>
       </v-col>
      </v-row>

      <v-row dense>
        <v-col cols=6>
          <v-card > 
            <v-card-title>SUCCESS</v-card-title>
            <v-card-text>
              <p class="display-1 text--primary">{{passed}}</p>
            </v-card-text>
          </v-card>
         </v-col>
         <v-col cols=6>
           <v-card > 
            <v-card-title>FAILURE</v-card-title>
            <v-card-text>
              <p class="display-1 text--primary">{{failed}}</p>
            </v-card-text>
          </v-card>
       </v-col>
      </v-row>

      <v-row dense>
        <v-col cols=6>
          <v-card > 
            <v-card-title>UNDEFINED</v-card-title>
            <v-card-text>
              <p class="display-1 text--primary">{{undef}}</p>
            </v-card-text>
          </v-card>
         </v-col>
      </v-row>

    </v-container>

 <!-- <div>
    <v-toolbar flat color="greylight" dense>
      <div class="flex-grow-1"></div>
      <v-toolbar-items>
        <v-select
          v-model="refresh_select"
          :items="refresh_list"
          prepend-icon="timer"
          @input="onRefreshChanged"
        ></v-select>
      </v-toolbar-items>
    </v-toolbar>    
    <v-container fluid grid-list-xl>
      <v-layout wrap>
        <v-flex xs12 >
          <v-label >TASKS</v-label>
        </v-flex>
        <v-flex xs12 sm6 md4>
          <v-card >
            <v-card-text>
              <v-chip class="mr-2" color="blue" text-color="white">{{running}} RUNNING</v-chip>
              <v-chip class="mr-2" color="grey" text-color="white">{{scheduled}} SCHEDULED</v-chip>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex xs12 >
          <v-label>RUNS</v-label>
        </v-flex>
        <v-flex xs12 sm6 md4>
          <v-card >
            <v-card-text>
              <v-chip class="mr-2" color="green" text-color="white">{{passed}} PASSED</v-chip>
              <v-chip class="mr-2" color="red" text-color="white">{{failed}} FAILED</v-chip>
              <v-chip class="mr-2" color="orange" text-color="white">{{undef}} UNDEFINED</v-chip>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>-->
</template>

<script>
  import { BackendApi } from '@/backend.js'
  export default {
      data() {
          return {
              running: 0,
              scheduled: 0,
              passed: 0,
              failed: 0,
              undef: 0,
              polling: null,
              refresh_select: 0,
              refresh_list: [ {"text": "Refresh disabled", "value": 0 },
                              {"text": "Refresh every 5s", "value": 5000 }, 
                              {"text": "Refresh every 10s", "value": 10000 },
                              {"text": "Refresh every 1min", "value": 60000 }  ],
              prjs_granted: []
          }
      },
      methods: {
        // get tasks listing from server
        async getTasksListing(){
          var running = 0
          var scheduled = 0
          await BackendApi.getTasksListing().then(resp => {
            if ( resp != undefined) {
              for (var i = 0; i < resp["tasks-listing"].length; i++) {
                if ( resp["tasks-listing"][i]["state"] == "RUNNING" ) {
                  running += 1
                } else if ( resp["tasks-listing"][i]["state"] == "WAITING" ) {
                  scheduled += 1
                }
              }
            }
          })
          this.running = running
          this.scheduled = scheduled
        },
        // get runs listing from server
        async getRunsListing(){
          var passed = 0
          var failed = 0
          var undef = 0
          for (var i = 0; i < this.prjs_granted.length; i++) {
            await BackendApi.getRunsListing(this.prjs_granted[i].id).then(resp => {
                if ( resp != undefined) {
                  for (var j=0; j < resp.listing.length; j++) {
                    if (resp.listing[j].state == "PASS"){
                      passed += 1
                    } else if (resp.listing[j].state == "FAIL"){
                      failed += 1
                    } else {
                      undef += 1
                    }
                  }
                }
              })
          }
          this.passed = passed
          this.failed = failed
          this.undef = undef
        },
        pollData () {
          // activate automatic refresh every xx second
          this.polling = setInterval(() => {
            this.getTasksListing()
            this.getRunsListing()
          }, this.refresh_select )
        },
        onRefreshChanged(){
          // stop the refresh
          clearInterval(this.polling)

          // restart the interval
          if (this.refresh_select > 0 ){
           this.pollData()
          }
        }
      },
      beforeDestroy () {
        // disable the automatic refresh when the page is not more displayed
        clearInterval(this.polling)
      },
      async created () {
        // retrieve user from local storage
        const user =  localStorage.getItem('user_session');
        const user_json =  JSON.parse(user)

        // get projects according to the user
        this.prjs_granted = await BackendApi.getProjectsGranted(user_json)

        // get from server tasks and runs
        this.getTasksListing()
        this.getRunsListing()

        // if refresh is not disabled then activate the automatic refresh
        if (this.refresh_select > 0 ){
          this.pollData()
        }
     }
  }
</script>