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
          <v-card-title class="black--text font-weight-bold">Running</v-card-title>
          <v-card-text class="display-1">{{running}}</v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 sm6 md4>
        <v-card >
          <v-card-title class="black--text font-weight-bold">Scheduled</v-card-title>
          <v-card-text class="display-1">{{scheduled}}</v-card-text>
        </v-card>
      </v-flex>
     <!-- <v-flex xs12 sm6 md4 >
        <v-card>
          <v-card-title class="black--text font-weight-bold">Completed</v-card-title>
          <v-card-text class="display-1">{{completed}}</v-card-text>
        </v-card>
      </v-flex>-->
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
             // completed: 0,
              scheduled: 0,
              polling: null,
              refresh_select: 0,
              refresh_list: [ {"text": "Refresh disabled", "value": 0 },
                              {"text": "Refresh every 5s", "value": 5000 }, 
                              {"text": "Refresh every 10s", "value": 10000 },
                              {"text": "Refresh every 1min", "value": 60000 }  ]
          }
      },
      methods: {
        getTasksListing(){
            BackendApi.getTasksListing().then(resp => {

              if ( resp != undefined) {
                var nb_running = 0
                var nb_scheduled = 0
                //var nb_completed =  0
                for (var i = 0; i < resp["tasks-listing"].length; i++) {
                  if ( resp["tasks-listing"][i]["state"] == "RUNNING" ) {
                    nb_running += 1
                  } else if ( resp["tasks-listing"][i]["state"] == "WAITING" || resp["tasks-listing"][i]["state"] == "DISABLED" ) {
                    nb_scheduled += 1
                  }/* else {
                    nb_completed += 1
                  }*/

                }
                this.running = nb_running
                this.scheduled = nb_scheduled
               // this.completed = nb_completed
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
        }
      },
      beforeDestroy () {
        clearInterval(this.polling)
      },

      created () {
        this.getTasksListing()

        if (this.refresh_select > 0 ){
          this.pollData()
        }
     }

  }
</script>
