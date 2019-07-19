<template>
  <div >  
      <v-toolbar  flat color="greylight">
          <v-btn @click="addItem"  color="green" dark class="mb-2">New Variable</v-btn>
      </v-toolbar>
      <v-dialog  
          v-model="dialog" 
          max-width="800px"
          persistent
          transition=""
          no-click-animation
       >
          
        <v-card>
          <v-card-title>
            <span class="headline">Variable</span>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"  >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list   v-if="this.editedIndex > -1" >
                <v-list-tile color="red" @click="deleteVariable">
                  <v-list-tile-title>Delete</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-container grid-list-md>
            <v-layout wrap>
             <v-flex xs12>
              <v-text-field 
                  v-model="editedItem.name"
                  label="Name"
                  required
                  @input="capitalize"
                  :rules="[() => !!editedItem.name || 'This field is required']"
                ></v-text-field>
              </v-flex>

             <v-flex xs12>
                  <editor  ref='myEditor' v-model="var_content" lang="json" theme="chrome" 
                     width="100%" height="400px" @init="editorInit" ></editor>
            </v-flex>
            </v-layout>
              </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat 
                      @click="validate"
                      :loading="loader_dialog">Save</v-btn>
          </v-card-actions>
        </v-card>
        
      </v-dialog>
      <v-container >
         <v-layout >
              <v-flex  >

        <v-card>
          <v-card-title>
            <span class="headline">Variables List </span>
            
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search by name"
              single-line
              hide-details
            ></v-text-field>
            
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-container fluid>
            <v-layout row>
             
             <v-flex>
              <v-select
                v-model="project_select"
                :items="projects_list"
                label="Project"
                prepend-icon="dashboard"
                @input="onProjectChanged"
              ></v-select>
            </v-flex>
            
              <v-spacer></v-spacer>
              <v-spacer></v-spacer>
              <v-spacer></v-spacer>
            </v-layout>
            <v-layout row>
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
                    {{ props.item.name }}
                    </td>
                    <td class="text-xs-left">
                    <v-btn icon class="mx-0"  @click="editItem(props.item)" >
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
  </div>
</template>

<script>
  import { EventBus } from '@/main'
  import { BackendApi } from '@/backend.js'
  const aceeditor = require('vue2-ace-editor')

 export default {
     components: {
        editor: aceeditor
    },
    data: () => ({
        datamodel: [],
        search: '',
        loader: false,
        loader_dialog: false,
        dialog: false,
        headers: [
                    { text: 'Id', align: 'left', value: 'id' },
                    { text: 'Name', align: 'left', value: 'name' },
                    { text: 'Value', align: 'left', value: 'value', 'sortable': false }
                ],
        rowsPerPageItems: [10, 20, 50],
        pagination: {
            rowsPerPage: 20
        },
        var_content: '',
        editedIndex: -1,
        editedItem: {  name: '',  id: '', value: ''  },
        project_select: 1,
        projects_list: [ {"text": "Common", "value": 1} ]
    }),
    created () {
      // retrieve user from local storage
      const user =  localStorage.getItem('user_session');
      const user_json =  JSON.parse(user)

      // enable the progress bar
      this.loader = true

      // call the server to retrieve all projects for admin level
      if (user_json.levels[0] == 'Administrator') {
        BackendApi.getProjects().then(resp => {
          if ( resp != undefined) {
            var i=0
            for (i = 0; i < resp.projects.length; ++i) {
              this.projects_list.push(
                                      {
                                        "text": resp.projects[i]["name"], 
                                        "value": resp.projects[i]["id"] 
                                        } 
                                      )
            }
          }
          // disable the progress bar
          this.loader = false
        })

      // call the backend to retrive projects authorized only for the user provided
      } else {
        BackendApi.getUser(user_json.user_id).then(resp => {
          if ( resp != undefined) {
            var i=0
            for (i = 0; i < resp.user.projects.length; ++i) {
              this.projects_list.push(
                                      {
                                        "text": resp.user.projects[i]["name"], 
                                        "value": resp.user.projects[i]["id"] 
                                        } 
                                      )
            }
          } 
        })
      }

      // finally load variables according to the project selected
      this.loadVariables( this.project_select )
    },
    methods: {
        loadVariables(prj_id){
          // enable the progress bar
          this.loader = true

          // get all variables according to the provided project id
          BackendApi.getVariables(prj_id).then(resp => {
            if ( resp != undefined) {
                this.datamodel = resp.variables
            }

            // disable the loader
            this.loader = false
          })

          
        },
        onProjectChanged(){
          // reload the variables according to the selected project
          this.loadVariables( this.project_select )
        },
        capitalize (){
          // automatic capitalization of the name of the variable
          this.$nextTick(() => {
            this.editedItem.name = this.editedItem.name.toUpperCase()
          }) 
        },
        editorInit:function (editor) {
            editor.getSession().setUseWrapMode(true)
           require('brace/mode/json')
           require('brace/theme/chrome')
        },
        addItem() {
          this.var_content = ""

          // show the form
          this.dialog = true
        },
        editItem (item) {
            this.editedIndex = this.datamodel.indexOf(item)
            this.editedItem = Object.assign({}, item)

            this.var_content = JSON.stringify(this.editedItem.value, undefined, 4)

            //show the dialog
            this.dialog = true
        },
        close () {
            // hide the dialog
            this.dialog = false

            this.editedItem = {  name: '',  id: '', value: '', "project-id": 1  }
            this.editedIndex = -1
        },
        async deleteVariable () {
          // enable progress
          this.loader_dialog = true

          var var_id = this.editedItem.id
          var prj_id = this.editedItem["project_id"]
          var item_index = this.editedIndex

          // call the backend to delete the variable
          await BackendApi.deleteVariable(var_id, prj_id).then(resp => {
              if ( resp != undefined) {
                this.datamodel.splice(item_index, 1)
              }  })
          
           // disable progress
          this.loader_dialog = false

          // reset the form
          this.close()
        },
        async validate () {
          // enable progress
          this.loader_dialog = true

          var item_index = this.editedIndex
          var var_id = parseInt(this.editedItem.id)

          var var_name = this.editedItem.name
          if ( !var_name.length  ){ 
            EventBus.$emit('AppWarning', "Name is required"); 
            // disable progress
            this.loader_dialog = false
            return;  
          }
          if ( !this.var_content.length  ){ 
            EventBus.$emit('AppWarning', "JSON content is required"); 
            // disable progress
            this.loader_dialog = false
            return;  
          }

          try {
            var json_content = JSON.parse(this.var_content)
          } catch (e) {
            EventBus.$emit('AppWarning', "Bad JSON provided!")
            // disable progress
           this.loader_dialog = false
            return
          }

          // call the backend api to update the variable
          if (item_index > -1) {
            this.editedItem.value =  json_content

            await BackendApi.updateVariable(var_id, var_name, json_content, this.project_select).then(resp => {
            if ( resp != undefined) {
              Object.assign(this.datamodel[item_index], this.editedItem)
            }  })

          // call the backend to add the variable
          } else {
            await BackendApi.addVariable(var_name, json_content, this.project_select).then(resp => {
              if ( resp != undefined) {
                this.editedItem.id = parseInt(resp['variable-id'])
                this.editedItem["project_id"] = this.project_select
                this.editedItem.value = json_content

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

<style scoped>
</style>
