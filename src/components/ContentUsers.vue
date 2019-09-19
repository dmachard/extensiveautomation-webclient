<template>
<v-container >
        <v-dialog 
          v-model="dialog" 
          max-width="600px"
          persistent 
          no-click-animation
          transition=""
        >
        <v-card>
          <v-card-title>
            <span class="headline">User Account</span>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"  >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list   v-if="this.editedIndex > -1" >
                <v-list-tile @click="resetPassword">
                  <v-list-tile-title>Reset password</v-list-tile-title>
                </v-list-tile>
                <v-list-tile color="red" @click="deleteUser">
                  <v-list-tile-title>Delete</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

          </v-card-title>

          <v-divider></v-divider>
          <v-card-text>

            <v-container grid-list-md>
            <v-layout wrap>
            <v-flex  xs12>
              <v-text-field 
                              v-model="editedItem.login" 
                              label="Login"
                              required
                              :rules="[() => !!editedItem.login || 'This field is required']"
                        ></v-text-field>
              </v-flex>

            <v-flex xs12 >
            <v-text-field 
                            :disabled=" this.editedIndex > -1" 
                            v-model="editedItem.password" 
                            label="Password"
                            :type="show1 ? 'text' : 'password'"
                            @click:append="show1 = !show1"
                            :append-icon="show1 ? 'visibility_off' : 'visibility'"
                            :rules="[() => !!editedItem.password || 'This field is required']"
                      ></v-text-field>
              </v-flex>
              <v-flex xs12>
             <v-text-field
                      v-model="editedItem.email"
                      label="E-mail"                      
                    ></v-text-field>
              </v-flex>
              
              <v-flex xs12 sm6 md4>
               <v-select
                    v-model="editedItem.level"
                    :items="level_items"
                    chips
                    label="Level"
                    required
                    dense
                  ></v-select>
               </v-flex>

            <v-flex xs12 sm8>
              <v-select
                  v-model="editedItem.projects"
                  :items="projects_items"
                  label="Projects granted"
                  multiple
                  chips
                  required
                  dense
                  deletable-chips
                ></v-select>
               </v-flex>

                <v-flex xs12>

             <v-text-field
                      v-model="editedItem.apikey_secret"
                      :readonly=true
                      label="API Key"                      
                    ></v-text-field>
              </v-flex>
                </v-layout>
              </v-container>
          </v-card-text>

          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Close</v-btn>
            <v-btn color="blue darken-1" flat 
                  @click="validate"
                  :loading="loader_dialog">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
   <v-layout >
       <v-flex>

        <v-card>
          <v-card-title>
            <v-btn @click="addItem"  color="green" dark class="mb-2">ADD USER</v-btn>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
            ></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-container >
            <v-layout wrap>
             
             <v-flex>

    <v-data-table
      :headers="headers"
      :items="datamodel"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      :search="search"
      :loading="loader"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-left">{{props.item.id}}</td>
        <td class="text-xs-left">
           {{ props.item.login }}
        </td>
        <td class="text-xs-left">
          <v-btn icon class="mx-0" @click="editItem(props.item)" >
            <v-icon >edit</v-icon>
          </v-btn>
        </td>
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
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
    data: () => ({
      title: 'Administration :: Users',
      dialog: false,
      loader: false,
      loader_dialog: false,
      search: '',
      headers: [
        { text: 'Id', align: 'left', value: 'id' },
        { text: 'Login', align: 'left', value: 'login' },
        { text: '', align: 'left', value: 'actions', 'sortable': false }
      ],
      datamodel: [],
     // dataprojects: [],
      editedIndex: -1,
      editedItem: { login: '',  
                    id: '', 
                    password: '',
                    email: '', 
                    level: 'tester', 
                    projects: [1], 
                    apikey_secret: ''},
      rowsPerPageItems: [10, 20, 50],
      pagination: {
          rowsPerPage: 10
      },
      level_items: [
          { "text": 'Administrator', "value": "administrator" },
          { "text": 'Monitor', "value": "monitor" },
          { "text": 'Tester', "value": "tester" }
        ],
      show1: false,
      projects_items: [  ]
    }),
    computed: {
    },
    created () {
      this.loader = true

      // get all users from backend
      BackendApi.getUsers().then(resp => {
        if ( resp != undefined) {
          this.datamodel = resp.users
        }
        this.loader = false
      })

      // get all projects in select list
      this.loader = true
      BackendApi.getProjects().then(resp => {
        if ( resp != undefined) {
          for (var i = 0; i < resp.projects.length; i++) {
            this.projects_items.push( { "text": resp.projects[i].name, "value": resp.projects[i].id } )
          }
        }
        this.loader = false
      })
    },
    methods: {
      addItem() {
        // show the form
        this.dialog = true
      },
      editItem (item) {
        this.editedIndex = this.datamodel.indexOf(item)
        this.editedItem = Object.assign({}, item)

        // show the dialog to edit the item
        this.dialog = true
      },
      close () {
        // hide the dialog
        this.dialog = false

        this.editedItem = {  login: '',  id: '', password: '', email: '', level: 'tester', projects: [1]}
        this.editedIndex = -1
      },
      async deleteUser () {
        // enable progress
        this.loader_dialog = true

        var user_id = this.editedItem.id
        var item_index = this.editedIndex

        // call the backend to delete the user
        await BackendApi.deleteUser(user_id).then(resp => {
            if ( resp != undefined) {
              this.datamodel.splice(item_index, 1)
            } 
        })
        
        // disable progress
        this.loader_dialog = false

        // close and reset the form
        this.close()
      },
      async resetPassword(){
        // enable progress
        this.loader_dialog = true

        var user_id = this.editedItem.id

        // call the backend to reset the password of the user
        await BackendApi.resetUserPassword(user_id).then(resp => {
          if ( resp != undefined) {
            EventBus.$emit('AppWarning', "Password cleared")
          }  
        })

        // disable progress
        this.loader_dialog = false
      },
      async validate () {
        // enable progress
        this.loader_dialog = true

        // get current item values
        var item_index = this.editedIndex
        var user_id = this.editedItem.id

        var user_login = this.editedItem.login
        if ( !user_login.length  ){
           EventBus.$emit('AppWarning', "Login is required"); 
           // disable progress
           this.loader_dialog = false
           return;  
        }

        var user_password = this.editedItem.password
        if ( !user_password.length  ){ 
            EventBus.$emit('AppWarning', "Password is required"); 
            // disable progress
            this.loader_dialog = false
            return;  
        }

        var user_email = this.editedItem.email
        var user_level = this.editedItem.level
        if ( !user_level.length  ){ 
          EventBus.$emit('AppWarning', "Level is required"); 
          // disable progress
           this.loader_dialog = false
          return;  
        }

        var user_lang = "en"
        var user_style = "default"
        var user_notifications = "false;false;false;false;false;false;false;"

        var user_projects = this.editedItem.projects
        if ( !user_projects.length  ){  
          EventBus.$emit('AppWarning', "Projects is required");  
          // disable progress
           this.loader_dialog = false
          return;
        }
        if ( !user_projects.includes(1)  ){ 
          EventBus.$emit('AppWarning', "Common project is mandatory");  
          // disable progress
           this.loader_dialog = false
          return; 
        }
        
        var user_defprj = user_projects[0]


        // call the backend api to update the user
        if (item_index > -1) {
          await BackendApi.updateUser(user_id, user_login, user_email, user_level, user_projects, 
                                      user_defprj, user_lang, user_style, user_notifications).then(resp => {
            if ( resp != undefined) {
              Object.assign(this.datamodel[item_index], this.editedItem)
            }  })

        // call the backend api to add a new user
        } else {
          await BackendApi.addUser(user_login, user_password, user_email, user_level, user_projects, 
                                    user_defprj, user_lang, user_style, user_notifications).then(resp => {
            if ( resp != undefined) {
              this.editedItem.id = parseInt(resp['user-id'])
              this.datamodel.push( Object.assign({}, this.editedItem) )
            }  })
        }

        // disable progress
        this.loader_dialog = false

        // close and reset the form
        this.close()
      }
    }
  }
</script>