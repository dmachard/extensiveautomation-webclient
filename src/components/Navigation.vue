<template>   
  <v-navigation-drawer 
    v-if="loggedIn" 
    fixed
    :clipped="$vuetify.breakpoint.mdAndUp"
    app
    v-model="drawer"
    >

      <v-list dense>
            <v-list-item @click="load_dashboard_p">
              <v-list-item-action>
              <v-icon>apps</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
      </v-list>

      <v-divider></v-divider>
      <v-list dense>
            
        <v-subheader> Storage  </v-subheader>

        <v-list-item @click="load_files_p">
          <v-list-item-action>
            <v-icon>code</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Editor</v-list-item-title>
          </v-list-item-content>
        </v-list-item>


        <v-list-item @click="load_variables_p">
          <v-list-item-action>
            <v-icon>settings_applications</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Globals</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
  </v-list>
  <v-divider></v-divider>
      <v-list dense>
            
        <v-subheader> Automation  </v-subheader>

        <v-list-item @click="load_tasks_p">
          <v-list-item-action>
            <v-icon>view_headline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Jobs</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="load_runs_p">
          <v-list-item-action>
            <v-icon>history</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Executions</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

  </v-list>
  <v-divider></v-divider>
    
  <v-list dense v-if="isAdmin" >
    <v-subheader> Administration  </v-subheader>
    <v-list-item @click="load_users_p">
      <v-list-item-action>
        <v-icon>people_outline</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Users</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item  @click="load_projects_p">
      <v-list-item-action>
        <v-icon>dashboard</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Workspaces</v-list-item-title>
      </v-list-item-content>
    </v-list-item> 
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
      load_runs_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Executions")

        // eslint-disable-next-line
        app.$router.push('/executions').catch(err => {})
      },
      load_files_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Editor")

        // eslint-disable-next-line
        app.$router.push('/editor').catch(err => {})
      },
      load_tasks_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Jobs")

        // eslint-disable-next-line
        app.$router.push('/jobs').catch(err => {})
      },
      load_variables_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Variables")

        // eslint-disable-next-line
        app.$router.push('/globals').catch(err => {})
      },
      load_users_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Users")

        // eslint-disable-next-line
        app.$router.push('/users').catch(err => {})
      },
      load_projects_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Projects")

        // eslint-disable-next-line
        app.$router.push('/projects').catch(err => {})
      },
      load_dashboard_p() {
        var app = this

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Dashboard")

        // eslint-disable-next-line
        app.$router.push('/dashboard').catch(err => {})
      },
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