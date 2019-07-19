<template>

  <v-toolbar dark app :clipped-left="$vuetify.breakpoint.mdAndUp" fixed>
    <v-toolbar-side-icon v-if="loggedIn"  @click.stop="hideNavigation"></v-toolbar-side-icon>
    <v-toolbar-title>Extensive Automation</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items >
    <v-menu v-if="loggedIn"  bottom left offset-y>
      <v-btn flat slot="activator">{{username}}</v-btn>
      
       <v-list>
        <v-list-tile  @click="userProfile"  >
          <v-list-tile-title>Account</v-list-tile-title>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile  @click="userLogout" >
          <v-list-tile-title>Logout</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    </v-toolbar-items>
  </v-toolbar>

  
  
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