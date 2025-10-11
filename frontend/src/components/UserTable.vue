<template>
  <v-card>
    <v-card-title>
      User Management System
    </v-card-title>

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
          <v-alert type="info" text>No users found.</v-alert>
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
      editDialog: false,
      editedUser: { uuid: '', name: '', email: '', city: '' },
      filters: { name: '', email: '', city: '' },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'City', value: 'city' },
        { text: 'Action', value: 'actions', sortable: false }
      ]
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
        this.closeEditDialog()
      } catch (err) {
        console.error('Error updating user:', err)
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  margin: 20px;
}
</style>
