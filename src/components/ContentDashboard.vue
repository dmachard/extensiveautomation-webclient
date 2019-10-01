<template>

<div>
<v-toolbar flat color="greylight">
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-select
                v-model="refresh_select"
                :items="refresh_list"
                prepend-icon="timer"
                @input="onRefreshChanged"
              ></v-select>
      </v-toolbar>
          
 <v-container fluid grid-list-xl>
    <v-layout wrap>
      <v-flex xs12 >
          <v-label >DASHBOARD > TASKS</v-label>
       </v-flex>
      <v-flex xs12 sm6 md4>
        <v-card >
          <v-card-text class="black--text display-1">
            <v-chip color="blue" text-color="white">{{running}} RUNNING</v-chip>
            <v-chip color="grey" text-color="white">{{scheduled}} SCHEDULED</v-chip>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 >
          <v-label >DASHBOARD > RUNS</v-label>
       </v-flex>
      <v-flex xs12 sm6 md4>
        <v-card >
          <v-card-text class="black--text display-1">
            <v-chip color="green" text-color="white">{{passed}} PASSED</v-chip>
            <v-chip color="red" text-color="white">{{failed}} FAILED</v-chip>
            <v-chip color="orange" text-color="white">{{undef}} UNDEFINED</v-chip>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>

</div>
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
        clearInterval(this.polling)
      },

      async created () {
        // retrieve user from local storage
        const user =  localStorage.getItem('user_session');
        const user_json =  JSON.parse(user)

        // get projects according to the user
        this.prjs_granted = await BackendApi.getProjectsGranted(user_json)

        this.getTasksListing()
        this.getRunsListing()

        if (this.refresh_select > 0 ){
          this.pollData()
        }
     }

  }
</script>
