<template>
  <div>
    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="2000" top>
      {{ snackbarText }}
    </v-snackbar>

    <!-- Shortcodes Display Section -->
    <p class="body-1 font-weight-bold">
      Shortcodes disponibles
    </p>
    <div class="d-flex flex-wrap align-center">
      <!-- Static shortcodes -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-chip
            class="mr-2 mb-2"
            small
            clickable
            v-on="on"
            @click="copyToClipboard('{{ contact.name }}')"
          >
            <span v-pre>{{ contact.name }}</span>
            <v-icon right x-small class="ml-1">mdi-content-copy</v-icon>
          </v-chip>
        </template>
        <span>Copiar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-chip
            class="mr-2 mb-2"
            small
            clickable
            v-on="on"
            @click="copyToClipboard('{{ contact.fullname }}')"
          >
            <span v-pre>{{ contact.fullname }}</span>
            <v-icon right x-small class="ml-1">mdi-content-copy</v-icon>
          </v-chip>
        </template>
        <span>Copiar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-chip
            class="mr-2 mb-2"
            small
            clickable
            v-on="on"
            @click="copyToClipboard('{{ contact.number }}')"
          >
            <span v-pre>{{ contact.number }}</span>
            <v-icon right x-small class="ml-1">mdi-content-copy</v-icon>
          </v-chip>
        </template>
        <span>Copiar</span>
      </v-tooltip>

      <!-- Loading indicator -->
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="16"
        width="2"
        color="primary"
        class="mr-2 mb-2"
      ></v-progress-circular>

      <!-- Custom Variables from API -->
      <template v-if="!loading">
        <v-chip
          v-for="variable in variables"
          :key="variable._id"
          class="mr-2 mb-2"
          small
          clickable
          color="primary"
          @click="openEditModal(variable)"
        >
          {{ '{' }}{ {{ variable.name }} }{{ '}' }}
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                right
                x-small
                class="ml-1"
                v-on="on"
                @click.stop="copyToClipboard('{{ ' + variable.name + ' }}')"
              >mdi-content-copy</v-icon>
            </template>
            <span>Copiar</span>
          </v-tooltip>
        </v-chip>
      </template>

      <!-- Add new variable button -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            x-small
            class="mb-2"
            v-on="on"
            @click="openCreateModal"
            :disabled="loading"
          >
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Crear nueva variable</span>
      </v-tooltip>
    </div>

    <p class="caption mt-2 mb-0">
      Los shortcodes serán reemplazados con la información del contacto al enviar el mensaje.
      Haz clic en una variable personalizada para editar sus valores.
    </p>

    <!-- Create Variable Dialog -->
    <v-dialog v-model="createDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-plus</v-icon>
          <span class="headline">Crear Nueva Variable</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeCreateModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-progress-linear v-if="saving" indeterminate color="primary"></v-progress-linear>
        <v-container class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="newVariableName"
                label="Nombre de la variable"
                outlined
                dense
                placeholder="Ej: mi_variable"
                hint="Solo usa letras, números, guiones bajos y puntos"
                persistent-hint
                :rules="nameRules"
                :disabled="saving"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" class="mt-3">
              <p class="body-2 font-weight-bold mb-2">Valores iniciales (opcional)</p>
              
              <!-- Inline add value -->
              <div class="d-flex align-center mb-2">
                <v-text-field
                  v-model="newValueInput"
                  label="Agregar valor"
                  outlined
                  dense
                  hide-details
                  class="mr-2"
                  @keyup.enter="addNewValue"
                  :disabled="saving"
                ></v-text-field>
                <v-btn
                  color="primary"
                  small
                  @click="addNewValue"
                  :disabled="!newValueInput.trim() || saving"
                >
                  <v-icon small>mdi-plus</v-icon>
                </v-btn>
              </div>
              
              <!-- Values list -->
              <v-chip
                v-for="(val, idx) in newVariableValues"
                :key="idx"
                close
                @click:close="removeNewVariableValue(idx)"
                class="mr-2 mb-2"
              >
                {{ val }}
              </v-chip>
              
              <!-- Bulk add values section -->
              <v-expansion-panels class="mb-3 mt-3" flat>
                <v-expansion-panel>
                  <v-expansion-panel-header class="pa-0">
                    <span class="d-flex align-center">
                      <v-icon left small color="primary">mdi-format-list-bulleted</v-icon>
                      <span class="primary--text">Agregar valores masivamente</span>
                    </span>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="pt-3">
                    <v-textarea
                      v-model="bulkCreateValuesInput"
                      label="Pega múltiples valores (uno por línea)"
                      outlined
                      dense
                      rows="8"
                      :placeholder="placeholderText"
                      hint="Cada línea se agregará como un valor separado"
                      persistent-hint
                    ></v-textarea>
                    <v-btn
                      color="success"
                      block
                      @click="parseBulkCreateValues"
                      :disabled="!bulkCreateValuesInput.trim() || saving"
                      class="mt-2"
                    >
                      <v-icon left>mdi-plus-multiple</v-icon>
                      Agregar {{ bulkCreateValuesInput.split('\n').filter(l => l.trim()).length }} valores
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <p v-if="newVariableValues.length === 0" class="caption text--secondary mt-1">
                Sin valores. Puedes agregarlos ahora o después.
              </p>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeCreateModal" :disabled="saving">Cancelar</v-btn>
          <v-btn 
            color="success" 
            @click="createVariable"
            :loading="saving"
            :disabled="!isValidName"
          >Crear Variable</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Variable Dialog -->
    <v-dialog v-model="editDialog" max-width="700px">
      <v-card v-if="currentVariable">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
          <v-text-field
            v-model="currentVariable.name"
            outlined
            dense
            hide-details
            single-line
            style="max-width: 300px;"
            :disabled="saving"
            :rules="nameRules"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn icon small @click="closeEditModal" :disabled="saving">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="deleteVariable" :disabled="saving">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-progress-linear v-if="saving" indeterminate color="primary"></v-progress-linear>
        <v-container class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <p class="body-2 font-weight-bold mb-2">
                Valores para <code>{{ '{' }}{ {{ currentVariable.name }} }{{ '}' }}</code>
              </p>
              
              <!-- Inline add value -->
              <div class="d-flex align-center mb-3">
                <v-text-field
                  v-model="editValueInput"
                  label="Agregar nuevo valor"
                  outlined
                  dense
                  hide-details
                  class="mr-2"
                  @keyup.enter="addEditValue"
                  :disabled="saving"
                ></v-text-field>
                <v-btn
                  color="primary"
                  small
                  @click="addEditValue"
                  :disabled="!editValueInput.trim() || saving"
                >
                  <v-icon small>mdi-plus</v-icon>
                </v-btn>
              </div>
              
              <!-- Bulk add values section -->
              <v-expansion-panels class="mb-3" flat>
                <v-expansion-panel>
                  <v-expansion-panel-header class="pa-0">
                    <span class="d-flex align-center">
                      <v-icon left small color="primary">mdi-format-list-bulleted</v-icon>
                      <span class="primary--text">Agregar valores masivamente</span>
                    </span>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="pt-3">
                    <v-textarea
                      v-model="bulkValuesInput"
                      label="Pega múltiples valores (uno por línea)"
                      outlined
                      dense
                      rows="8"
                      :placeholder="placeholderText"
                      hint="Cada línea se agregará como un valor separado"
                      persistent-hint
                    ></v-textarea>
                    <v-btn
                      color="success"
                      block
                      @click="parseBulkValues"
                      :disabled="!bulkValuesInput.trim() || saving"
                      class="mt-2"
                    >
                      <v-icon left>mdi-plus-multiple</v-icon>
                      Agregar {{ bulkValuesInput.split('\n').filter(l => l.trim()).length }} valores
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              
              <!-- Values list with editable inputs -->
              <div v-if="currentValues.length > 0" class="mt-3">
                <div v-for="(val, idx) in currentValues" :key="idx" class="d-flex align-center mb-2">
                  <v-text-field
                    v-model="currentValues[idx]"
                    outlined
                    dense
                    hide-details
                    class="mr-2"
                    :disabled="saving"
                    @keyup.enter="addEmptyValue"
                  ></v-text-field>
                  <v-btn icon x-small @click="copyToClipboard(val)" class="mr-1">
                    <v-icon x-small>mdi-content-copy</v-icon>
                  </v-btn>
                  <v-btn icon x-small color="error" @click="removeEditValue(idx)" :disabled="saving">
                    <v-icon x-small>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <v-btn
                  text
                  small
                  color="primary"
                  @click="addEmptyValue"
                  :disabled="saving"
                  class="mt-2"
                >
                  <v-icon left small>mdi-plus</v-icon>
                  Agregar valor vacío
                </v-btn>
              </div>
              <p v-else class="caption text--secondary mt-1">
                Sin valores. Agrega uno arriba o usa la opción masiva.
              </p>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeEditModal" :disabled="saving">Cerrar</v-btn>
          <v-btn 
            color="primary" 
            @click="saveVariableChanges"
            :loading="saving"
            :disabled="!currentVariable.name || !/^[a-zA-Z0-9_.]+$/.test(currentVariable.name)"
          >Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import shortcodesValuesApi from "@/services/api/shortcodesValues";

export default {
  name: "ShortcodesManager",
  
  data() {
    return {
      // State
      variables: [],
      loading: false,
      saving: false,
      
      // Snackbar
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
      
      // Create modal
      createDialog: false,
      newVariableName: '',
      newVariableValues: [],
      newValueInput: '',
      bulkCreateValuesInput: '',
      
      // Edit modal
      editDialog: false,
      currentVariable: null,
      currentValues: [],
      editValueInput: '',
      bulkValuesInput: '',
      
      // Placeholder text for bulk values
      placeholderText: `{{ contact.name }}, aquí con la mejor energía para ti 💜
{{ contact.name }}, deseamos que tengas un día lindo 💫
{{ contact.name }}, deseamos que todo marche súper bien 💜`,
      
      // Validation rules
      nameRules: [
        v => !!v || 'El nombre es requerido',
        v => /^[a-zA-Z0-9_.]+$/.test(v) || 'Solo usa letras, números, guiones bajos y puntos'
      ],
    };
  },
  
  computed: {
    isValidName() {
      return this.newVariableName && /^[a-zA-Z0-9_.]+$/.test(this.newVariableName);
    },
    
    companyId() {
      return this.$store.getters["authModule/getCurrentCompany"].company._id;
    }
  },
  
  mounted() {
    this.fetchVariables();
  },
  
  methods: {
    // Show notification
    showNotification(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    
    // Fetch all variables
    async fetchVariables() {
      this.loading = true;
      try {
        const response = await shortcodesValuesApi.list({
          companyId: this.companyId,
        });
        
        if (response.data && response.data.payload) {
          this.variables = response.data.payload;
        }
      } catch (error) {
        console.error("Error fetching variables:", error);
        this.showNotification("Error al cargar las variables", "error");
      } finally {
        this.loading = false;
      }
    },
    
    // Copy to clipboard
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Copiado al portapapeles');
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.showNotification('Copiado al portapapeles');
        } catch (err) {
          console.error('Error al copiar:', err);
        }
        document.body.removeChild(textArea);
      });
    },
    
    // === CREATE MODAL ===
    openCreateModal() {
      this.newVariableName = '';
      this.newVariableValues = [];
      this.newValueInput = '';
      this.bulkCreateValuesInput = '';
      this.createDialog = true;
    },
    
    closeCreateModal() {
      this.createDialog = false;
      this.newVariableName = '';
      this.newVariableValues = [];
      this.newValueInput = '';
      this.bulkCreateValuesInput = '';
    },
    
    addNewValue() {
      if (!this.newValueInput.trim()) return;
      this.newVariableValues.push(this.newValueInput.trim());
      this.newValueInput = '';
    },
    
    parseBulkCreateValues() {
      if (!this.bulkCreateValuesInput.trim()) return;
      
      // Split by lines, filter empty lines, and trim each value
      const newValues = this.bulkCreateValuesInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Add all new values to the current values array
      this.newVariableValues = [...this.newVariableValues, ...newValues];
      
      // Clear the textarea
      this.bulkCreateValuesInput = '';
      
      this.showNotification(`Se agregaron ${newValues.length} valores`);
    },
    
    async createVariable() {
      if (!this.isValidName) return;
      
      this.saving = true;
      try {
        const payload = {
          name: this.newVariableName,
          values: this.newVariableValues,
          companyId: this.companyId
        };
        
        const response = await shortcodesValuesApi.create(payload);
        // API returns the object directly in response.data
        this.variables = [...this.variables, response.data];
        this.showNotification("Variable creada correctamente");
        this.closeCreateModal();
      } catch (error) {
        console.error("Error creating variable:", error);
        this.showNotification("Error al crear la variable", "error");
      } finally {
        this.saving = false;
      }
    },
    
    // === EDIT MODAL ===
    openEditModal(variable) {
      this.currentVariable = { ...variable };
      this.currentValues = [...variable.values];
      this.editValueInput = '';
      this.bulkValuesInput = '';
      this.editDialog = true;
    },
    
    closeEditModal() {
      this.editDialog = false;
      this.currentVariable = null;
      this.currentValues = [];
      this.editValueInput = '';
      this.bulkValuesInput = '';
    },
    
    addEditValue() {
      if (!this.editValueInput.trim()) return;
      this.currentValues.push(this.editValueInput.trim());
      this.editValueInput = '';
    },
    
    parseBulkValues() {
      if (!this.bulkValuesInput.trim()) return;
      
      // Split by lines, filter empty lines, and trim each value
      const newValues = this.bulkValuesInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Add all new values to the current values array
      this.currentValues = [...this.currentValues, ...newValues];
      
      // Clear the textarea
      this.bulkValuesInput = '';
      
      this.showNotification(`Se agregaron ${newValues.length} valores`);
      
      // Auto-save after adding bulk values
      this.saveVariableChanges();
    },
    
    addEmptyValue() {
      // Add empty value at the end
      this.currentValues.push('');
      // Focus on the new input in next tick
      this.$nextTick(() => {
        const inputs = this.$el.querySelectorAll('.v-text-field input');
        if (inputs.length > 0) {
          inputs[inputs.length - 1].focus();
        }
      });
    },
    
    removeEditValue(index) {
      this.currentValues.splice(index, 1);
    },
    
    async saveVariableChanges() {
      if (!this.currentVariable.name || !/^[a-zA-Z0-9_.]+$/.test(this.currentVariable.name)) {
        this.showNotification('El nombre de la variable no es válido', 'error');
        return;
      }
      
      // Filter out empty values before saving
      const filteredValues = this.currentValues.filter(v => v.trim().length > 0);
      
      await this.persistVariable(filteredValues);
    },
    
    async persistVariable(values = null) {
      this.saving = true;
      try {
        const payload = {
          name: this.currentVariable.name,
          values: values || this.currentValues, // Send entire values array
          companyId: this.companyId
        };
        
        const response = await shortcodesValuesApi.update(this.currentVariable._id, payload);
        // API returns the object directly in response.data
        const updatedVar = response.data;
        
        // Update in list
        const index = this.variables.findIndex(v => v._id === this.currentVariable._id);
        if (index !== -1) {
          this.variables = [
            ...this.variables.slice(0, index),
            updatedVar,
            ...this.variables.slice(index + 1)
          ];
        }
        
        this.currentVariable = updatedVar;
        this.currentValues = [...updatedVar.values];
        this.showNotification("Guardado correctamente");
        
        // If this was a bulk add, close the modal
        if (values !== null) {
          setTimeout(() => {
            this.closeEditModal();
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving variable:", error);
        this.showNotification("Error al guardar", "error");
      } finally {
        this.saving = false;
      }
    },
    
    async deleteVariable() {
      if (!confirm('¿Eliminar esta variable y todos sus valores?')) return;
      
      this.saving = true;
      try {
        await shortcodesValuesApi.delete(this.currentVariable._id);
        this.variables = this.variables.filter(v => v._id !== this.currentVariable._id);
        this.showNotification("Variable eliminada");
        this.closeEditModal();
      } catch (error) {
        console.error("Error deleting variable:", error);
        this.showNotification("Error al eliminar", "error");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
</style>
