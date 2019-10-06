<template>
 <div>
    <v-app-bar  color="black"
      dark
      fixed
      app
      :clipped-left="$vuetify.breakpoint.mdAndUp" 
    >
       <v-app-bar-nav-icon v-if="loggedIn"  @click.stop="hideNavigation"></v-app-bar-nav-icon>
    <v-toolbar-title>Extensive Automation</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items >
    <v-menu v-if="loggedIn"  bottom left offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on">
          <v-icon>person</v-icon>
          {{username}}
        </v-btn>
      </template>
       <v-list>
        <v-list-item  @click="userProfile"  >
          <v-list-item-title>
            <v-icon>account_circle</v-icon>
            Account
            </v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item  @click="userLogout" >
          <v-list-item-title>
              <v-icon>exit_to_app</v-icon>
              Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    </v-toolbar-items>
  <!--  </v-toolbar>-->

      </v-app-bar>
  </div>
  
</template>
 
<script>
  import { EventBus } from '@/main'

  export default {
    data () {
      return {
        loggedIn: false,
        username: "undefined"
      }
    },
    methods: {
      hideNavigation() {
        this.$emit('hideNavigation')
      },
      userProfile(){
        this.$emit('userProfile')
      },
      userLogout(){
        this.$emit('userLogout')
      }
   },
    created:function() {
      EventBus.$on('ApiLogged', obj => {
        this.username = obj.api_login
        this.loggedIn = true;      
      });

      EventBus.$on('ApiLogout', obj => {
          this.username = obj.api_login
          this.loggedIn = false;      
      });

      this.loggedIn = true;
      const user =  localStorage.getItem('user_session')
     
      if(user === null || user === undefined) {
        this.loggedIn = false;
      } else {
        const user_json =  JSON.parse(user)
        this.username = user_json.api_login
      }
    }
  }
</script>