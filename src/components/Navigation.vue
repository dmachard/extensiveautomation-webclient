<template>   
   <v-navigation-drawer 
      v-if="loggedIn" 
      fixed
      :clipped="$vuetify.breakpoint.mdAndUp"
      app
      v-model="drawer"
      >
    <v-list dense>
        
        <v-subheader> Tests  </v-subheader>

        <v-list-tile @click="load_variables_p">
        <v-list-tile-action>
              <v-icon>settings_applications</v-icon>
            </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Variables</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    
    <v-list dense v-if="isAdmin" >
        
        <v-subheader> Administration  </v-subheader>
        
        <v-list-tile @click="load_users_p">
       <v-list-tile-action>
            <v-icon>people_outline</v-icon>
          </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Users</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
            
        
        
        <v-list-tile  @click="load_projects_p">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Projects</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        
    </v-list>
    <v-divider></v-divider>
    
    </v-navigation-drawer>
</template>
 
<script>
  import { EventBus } from '@/main'

  export default {
    props: {
      nav: Boolean
    },
    data () {
      return {
        loggedIn: false,
        isAdmin: false,
        drawer: true,
        items: [
          { title: 'Home', icon: 'dashboard' },
          { title: 'About', icon: 'question_answer' }
        ],
        mini: false,
       // right: null,
        username: "undefined"
      }
    },
      watch: {
        nav: function () {
          this.drawer = !this.drawer
        }
      },
     methods: {
      load_variables_p() {
        var app = this;
        app.$router.push('/variables');
      },
      load_users_p() {
        var app = this;
        app.$router.push('/users');
      },
      load_projects_p() {
        var app = this;
        app.$router.push('/projects');
      }
     },
    created:function() {
      EventBus.$on('ApiLogged', user => {
            this.loggedIn = true;  

            // detect the level access of the user 
            if (user.levels[0] == 'Administrator') {
              this.isAdmin = true
            } else {
              this.isAdmin = false
            }

        });

      EventBus.$on('ApiLogout', obj => {
          this.username = obj.api_login
          this.loggedIn = false;      
      });

      this.loggedIn = true;
      const user =  localStorage.getItem('user_session');
      if(user === null || user === undefined) {
        this.loggedIn = false;
      } else {
        const user_json =  JSON.parse(user)

        /// detect the level access of the user 
        if (user_json.levels[0] == 'Administrator') {
          this.isAdmin = true
        } else {
          this.isAdmin = false
        }
      }
    }
  }
</script>