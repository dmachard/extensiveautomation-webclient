<template>

<v-container >
  
      <v-dialog  
          v-model="dialog" 
          max-width="500px"
          persistent 
          no-click-animation
          transition=""
          >
          
        <v-card>
          <v-card-title>
            <span class="headline">Project</span>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"  >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list   v-if="this.editedIndex > -1" >
                <v-list-tile 
                            color="red" 
                            @click="deleteProject">
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
                            :rules="[() => !!editedItem.name || 'This field is required']"
                      ></v-text-field>
              </v-flex>
            </v-layout>
              </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn 
                  color="blue darken-1" flat 
                  @click="validate" 
                  :loading="loader_dialog" >Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

   <v-layout >
        <v-flex>
        <v-card>
          <v-card-title>
            <v-btn   dark color="green" @click="addItem"  >
              ADD PROJECT
            </v-btn>
          
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

</template>

<script>
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
    data: () => ({
      title: 'Administration :: Projects',
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
      editedItem: {  name: '',  id: ''  },
      rowsPerPageItems: [10, 20, 50],
      pagination: {
          rowsPerPage: 10
      },
    }),
    created () {
      // enable progress bar
      this.loader = true

      BackendApi.getProjects().then(resp => {
        if ( resp != undefined) {
            this.datamodel = resp.projects
        }

        // disable progress bar
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
        this.dialog = true
      },
      close () {
        // hide the dialog
        this.dialog = false

        this.editedItem = {  name: '',  id: ''  }
        this.editedIndex = -1
      },
      async deleteProject () {
        // enable progress
        this.loader_dialog = true

        var prj_id = this.editedItem.id
        var item_index = this.editedIndex

        await BackendApi.deleteProject(prj_id).then(resp => {
            if ( resp != undefined) {
              this.datamodel.splice(item_index, 1)
            }  })

        // disable progress
        this.loader_dialog = false

         // close and reset the form
        this.close()
      },
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