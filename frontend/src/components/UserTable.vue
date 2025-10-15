<template>
  <v-card>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field v-model="filters.name" label="Filter by Name" outlined dense clearable></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="filters.email" label="Filter by Email" outlined dense clearable></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="filters.city" label="Filter by City" outlined dense clearable></v-text-field>
        </v-col>
      </v-row>
          <v-card-title class="d-flex justify-center pt-0 " style="padding: 45px">
      <v-btn color="primary" @click="fetchUser" :loading="fetchLoading">
          Fetch User from API
      </v-btn>
    </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :items-per-page="25"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" @click="openEditDialog(item)">Edit</v-btn>
        </template>
        <template v-slot:no-data>
          <v-alert type="info" text>
            No users found. Click "Fetch User from API" to add users.
          </v-alert>
        </template>
      </v-data-table>
    </v-card-text>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedUser.name" label="Name" outlined></v-text-field>
          <v-text-field v-model="editedUser.email" label="Email" outlined></v-text-field>
          <v-text-field v-model="editedUser.city" label="City" outlined></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey" @click="closeEditDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

export default {
  name: 'UserTable',
  data() {
    return {
      users: [],
      fetchLoading: false,
      editDialog: false,
      editedUser: { uuid: '', name: '', email: '', city: '' },
      filters: { name: '', email: '', city: '' },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'City', value: 'city' },
        { text: 'Action', value: 'actions', sortable: false }
      ],
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success'
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        return (!this.filters.name || user.name.toLowerCase().includes(this.filters.name.toLowerCase()))
          && (!this.filters.email || user.email.toLowerCase().includes(this.filters.email.toLowerCase()))
          && (!this.filters.city || user.city.toLowerCase().includes(this.filters.city.toLowerCase()))
      })
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      try {
        const res = await axios.get(`${API_BASE_URL}/users`)
        if (res.data.success) this.users = res.data.data
      } catch (err) {
        console.error('Error loading users:', err)
      }
    },
    async fetchUser() {
      this.fetchLoading = true
      try {
        const res = await axios.post(`${API_BASE_URL}/users/fetch`)
        
        if (res.data.success) {
          if (res.data.inserted) {
            this.showSnackbar(
              `User ${res.data.currentCount}/1000 inserted: ${res.data.user.name}`,
              'success'
            )
            await this.loadUsers()
          } else {
            this.showSnackbar(res.data.message, 'info')
          }
        } else {
          this.showSnackbar(res.data.message || 'Error fetching user', 'error')
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        this.showSnackbar('Error fetching user from API', 'error')
      } finally {
        this.fetchLoading = false
      }
    },
    openEditDialog(user) {
      this.editedUser = { ...user }
      this.editDialog = true
    },
    closeEditDialog() {
      this.editDialog = false
      this.editedUser = { uuid: '', name: '', email: '', city: '' }
    },
    async saveUser() {
      try {
        await axios.put(`${API_BASE_URL}/users/${this.editedUser.uuid}`, this.editedUser)
        const index = this.users.findIndex(u => u.uuid === this.editedUser.uuid)
        if (index !== -1) this.users.splice(index, 1, { ...this.editedUser })
        this.showSnackbar('User updated successfully', 'success')
        this.closeEditDialog()
      } catch (err) {
        console.error('Error updating user:', err)
        this.showSnackbar('Error updating user', 'error')
      }
    },
    showSnackbar(text, color) {
      this.snackbarText = text
      this.snackbarColor = color
      this.snackbar = true
    }
  }
}
</script>
<style scoped> 
.v-data-table { 
  border: 2px solid #8d8888; 
 border-radius: 8px; 
 overflow: hidden; 
 } 
 ::v-deep(.v-data-table th),
::v-deep(.v-data-table td) {
  border: 1px solid #8d8888;  
  padding: 12px;
  text-align: center;
}
::v-deep(.v-data-table th) {
  background-color: #f0f0f0 ;
  color: #000000 ;
  font-weight: 600;
}
</style>