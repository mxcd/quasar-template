<template>
  <q-table
    title="Users"
    :rows="items"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    :loading="loading"
    :filter="filter"
    @request="onRequest"
    @row-click="navigateToUser"
    :rows-per-page-options="[10, 25, 50, 100]"
    flat
    bordered
  >
    <template v-slot:top-right>
      <q-btn
        color="primary"
        icon="add"
        label="Create User"
        class="q-mr-md"
        @click="router.push('/users/new')"
      />
      <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template v-slot:body-cell-id="props">
      <q-td :props="props">
        <span class="text-mono">UUID</span>
        <q-tooltip>{{ props.row.id }}</q-tooltip>
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="content_copy"
          @click.stop="copyToClipboard(props.row.id)"
        >
          <q-tooltip>Copy ID</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <template v-slot:body-cell-email="props">
      <q-td :props="props">
        {{ props.row.email || 'N/A' }}
      </q-td>
    </template>

    <template v-slot:body-cell-active="props">
      <q-td :props="props">
        <q-badge :color="props.row.active ? 'positive' : 'negative'">
          {{ props.row.active ? 'Yes' : 'No' }}
        </q-badge>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QTableProps } from 'quasar';
import users from 'src/api/users';
import type { User } from 'src/api/authentication';
import { formatISODateToLocal } from 'src/api/util';
import { WebsocketMessage } from 'src/api/websocket';
import { emitter } from 'src/boot/mitt';

const router = useRouter();
const $q = useQuasar();

const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'username', label: 'Username', field: 'username', align: 'left', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'left', sortable: true },
  { name: 'active', label: 'Active', field: 'active', align: 'center', sortable: true },
  { name: 'createdAt', label: 'Created At', field: 'createdAt', sortable: true, format: formatISODateToLocal },
  { name: 'updatedAt', label: 'Updated At', field: 'updatedAt', sortable: true, format: formatISODateToLocal },
];

const items = ref<User[]>([]);
const filter = ref('');
const loading = ref(false);
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filterValue = props.filter;

  filter.value = filterValue;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  await load();
}

onMounted(load);
async function load() {
  try {
    loading.value = true;
    const result = await users.list({
      limit: pagination.value.page * pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
      sort: pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      search: filter.value,
    });
    items.value = result.items;
    pagination.value.rowsNumber = result.total;
  } catch (error) {
    console.error('Failed to load users:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load users',
    });
  } finally {
    loading.value = false;
  }
}

emitter.on('ws:message', (msg: WebsocketMessage) => {
  if (msg.object !== 'user') {
    return;
  }
  const updatedUser = msg.data as User;
  if (msg.action === 'create') {
    items.value.push(updatedUser);
  } else if (msg.action === 'update') {
    const index = items.value.findIndex(existingUser => existingUser.id === updatedUser.id);
    if (index !== -1) {
      items.value[index] = updatedUser;
    }
  } else if (msg.action === 'delete') {
    items.value = items.value.filter(existingUser => existingUser.id !== updatedUser.id);
  }
});

function navigateToUser(_event: Event, row: User) {
  router.push(`/users/${row.id}`);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  $q.notify({
    type: 'positive',
    message: 'Copied to clipboard',
    timeout: 1000,
  });
}
</script>

<style scoped>
:deep(tbody tr) {
  cursor: pointer;
}

.text-mono {
  font-family: monospace;
  font-size: 0.85em;
}
</style>
