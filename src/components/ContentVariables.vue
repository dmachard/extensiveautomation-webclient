<template>
  <v-container >
    <v-dialog v-model="dialog" 
              max-width="800px"
              persistent
              transition=""
              no-click-animation
     >
      <v-card>
        <v-card-title>
        <span class="headline">Variable</span>
        <v-spacer></v-spacer>
        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on"  >
            <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list v-if="this.editedIndex > -1" >
          <v-list-item color="red" @click="deleteVariable">
            <v-list-item-title>
            <v-icon>delete</v-icon>Delete
            </v-list-item-title>
          </v-list-item>
          </v-list>
        </v-menu>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="editedItem.name"
                              label="Name"
                              required
                              @input="capitalize"
                              :rules="[() => !!editedItem.name || 'This field is required']"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <editor ref='myEditor'
                        v-model="var_content"
                        lang="json"
                        theme="chrome" 
                        width="100%"
                        height="400px"
                        @init="editorInit"></editor>
              </v-flex>
            </v-layout>
            </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1"
                text
                @click="close">Cancel</v-btn>
          <v-btn color="blue darken-1"
                text 
                @click="validate"
                :loading="loader_dialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout >
      <v-flex  >
        <v-card>
          <v-card-title>
            <v-btn @click="addItem"
                   color="green"
                   dark
                   class="mb-2">ADD VARIABLE</v-btn>
            <v-spacer></v-spacer>
            <v-select v-model="project_select"
                      :items="projects_list"
                      label="Project"
                      prepend-icon="dashboard"
                      @input="onProjectChanged"
            ></v-select>
            <v-spacer></v-spacer>
            <v-text-field v-model="search"
                          append-icon="search"
                          label="Search"
            ></v-text-field>
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
                                :loading="loader"
                  >
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon
                            class="mx-0"
                            @click="editItem(item)" >
                        <v-icon >edit</v-icon>
                      </v-btn>
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
                    { text: '', align: 'left', value: 'actions', 'sortable': false }
                ],
        var_content: '',
        editedIndex: -1,
        editedItem: {  name: '',  id: '', value: ''  },
        project_select: 1,
        projects_list: [ {"text": "Common", "value": 1} ]
    }),
    async created () {
      // retrieve user from local storage
      const user =  localStorage.getItem('user_session');
      const user_json =  JSON.parse(user)

      // enable the progress bar
      this.loader = true

      // get projects according to the user
      var prjs_granted_list = await BackendApi.getProjectsGranted(user_json)

      for (var i = 0; i < prjs_granted_list.length; ++i) {
        this.projects_list.push(
                  {
                    "text": prjs_granted_list[i]["name"], 
                    "value": prjs_granted_list[i]["id"] 
                    } 
                  )
      }

      // finally load variables according to the project selected
      this.loadVariables( this.project_select )

      // disable loader
      this.loader = false
    },
    methods: {
      // load variables from server
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

      // refresh variables when the project is modified
      onProjectChanged(){
        // reload the variables according to the selected project
        this.loadVariables( this.project_select )
      },

      // force to capitalize variable name
      capitalize (){
        // automatic capitalization of the name of the variable
        this.$nextTick(() => {
          this.editedItem.name = this.editedItem.name.toUpperCase()
        }) 
      },

      // init the json editor
      editorInit:function (editor) {
          editor.getSession().setUseWrapMode(true)
          require('brace/mode/json')
          require('brace/theme/chrome')
      },

      // open the dialog to create/edit a variable
      addItem() {
        this.var_content = ""

        // show the form
        this.dialog = true
      },

      // open the dialog to edit the variable
      editItem (item) {
          this.editedIndex = this.datamodel.indexOf(item)
          this.editedItem = Object.assign({}, item)

          this.var_content = JSON.stringify(this.editedItem.value, undefined, 4)

          //show the dialog
          this.dialog = true
      },

      // close the dialog
      close () {
          // hide the dialog
          this.dialog = false

          this.editedItem = {  name: '',  id: '', value: '', "project-id": 1  }
          this.editedIndex = -1
      },

      // call the server to delete a variable
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

      // save the new variable in the server side
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