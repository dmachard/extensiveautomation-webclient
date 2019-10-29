<template>
  <v-container >
    <v-dialog v-model="dialog" 
              max-width="500px"
              persistent 
              no-click-animation
              transition=""
      >
      <v-card>
        <v-card-title>
          <span class="headline">Project</span>
          <!--<v-spacer></v-spacer>
          <v-menu bottom left offset-y>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on"  >
                <v-icon>more_vert</v-icon>
              </v-btn>
            </template>
            <v-list  v-if="this.editedIndex > -1" >
              <v-list-item color="red" 
                           @click="deleteProject">
                <v-list-item-title>
                <v-icon>delete</v-icon>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>-->
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field  v-model="editedItem.name" 
                               label="Name"
                               :rules="[() => !!editedItem.name || 'This field is required']"
                  ></v-text-field>
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
                 :loading="loader_dialog" >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout >
      <v-flex>
      <v-card>
        <v-card-title>
          <v-btn dark
                 color="green"
                 @click="addItem" >ADD PROJECT</v-btn>
          <v-spacer></v-spacer>
          <v-text-field v-model="search"
                        append-icon="search"
                        label="Search"
          ></v-text-field>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <!--<v-container >
            <v-layout wrap>
              <v-flex>-->
                <v-data-table :headers="headers"
                              :items="datamodel"
                              :items-per-page="10"
                              :search="search"
                              :loading="loader"
                              show-select
                              v-model="selected"
                    >
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon class="mx-0"  @click="editItem(item)" >
                      <v-icon >edit</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
                <div>
                    <v-btn 
                        v-if="selected.length != 0"
                        dark
                        color="red"
                        @click="deleteProjects" >
                          <v-icon>delete</v-icon>
                        Remove
                    </v-btn>
                </div>
             <!-- </v-flex>
            </v-layout>
          </v-container>-->
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
      selected: [],
      dialog: false,
      loader: false,
      loader_dialog: false,
      search: '',
      headers: [
        { text: 'Id', align: 'left', value: 'id' },
        { text: 'Name', align: 'left', value: 'name' },
        { text: '', align: 'left', value: 'actions', 'sortable': false }
      ],
      datamodel: [],
      editedIndex: -1,
      editedItem: {  name: '',  id: ''  }
    }),
    created () {
      // enable progress bar
      this.loader = true

      // get projects list from server
      this.getProjectsListing()

      // disable progress bar
      this.loader = false
      
    },
    methods: {
      // get projects
      getProjectsListing(){
        BackendApi.getProjects().then(resp => {
          if ( resp != undefined) {
              this.datamodel = resp.projects
          }
        })
      },
      // delete selected projects
      deleteProjects(){
        for (var i = 0; i < this.selected.length; ++i) {
          this.deleteProject(this.selected[i].id)
        }

        // reset selected items
        this.selected = []
      },
      // delete a project in the server
      deleteProject (prj_id) {
        BackendApi.deleteProject(prj_id).then(resp => {
            if ( resp != undefined) {
              this.getProjectsListing()
            }  
        })
      },
      // create a new project
      addItem() {
        // show the form
        this.dialog = true
      },

      // edit a project
      editItem (item) {
        this.editedIndex = this.datamodel.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      // close the dialog to create/edit a new project
      close () {
        // hide the dialog
        this.dialog = false

        this.editedItem = {  name: '',  id: ''  }
        this.editedIndex = -1
      },

      // create/edit a project to the server
      async validate () {
        // enable progress
        this.loader_dialog = true

        // check graphical inputs
        var item_index = this.editedIndex
        var project_id = this.editedItem.id
        var project_name = this.editedItem.name
        if ( !project_name.length  ){ 
          EventBus.$emit('AppWarning', "The field name is required"); 
          // disable progress
           this.loader_dialog = false
          return;  
        }

        // call the backend api to update the project
        if (item_index > -1) {
          await BackendApi.renameProject(project_id, project_name).then(resp => {
            if ( resp != undefined) {
              Object.assign(this.datamodel[item_index], this.editedItem)
            }  })

        // call the backend api to add a new project
        } else {
          await BackendApi.addProject(project_name).then(resp => {
            if ( resp != undefined) {
              this.editedItem.id = parseInt(resp['project-id'])
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