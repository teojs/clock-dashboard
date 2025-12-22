<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, PlusCircle, Trash2, ChevronUp, ChevronDown, Code, List } from 'lucide-vue-next';
import type { HAConfig, HAEntity } from '../types';

const props = defineProps<{
  show: boolean;
  entitiesStates?: Record<string, any>;
}>();

const emit = defineEmits(['close', 'saved']);

const config = ref<HAConfig>(JSON.parse(localStorage.getItem('ha_config') || '{"url":"","token":"","entities":[]}'));
const isJsonMode = ref(false);
const jsonInput = ref('');

// 切换模式时同步数据
watch(isJsonMode, (newVal) => {
  if (newVal) {
    // 导出包括 URL、Token 和 实体列表的全量 JSON
    jsonInput.value = JSON.stringify({
      url: config.value.url,
      token: config.value.token,
      entities: config.value.entities
    }, null, 2);
  } else {
    try {
      const parsed = JSON.parse(jsonInput.value);
      if (parsed && typeof parsed === 'object') {
        if (parsed.url !== undefined) config.value.url = parsed.url;
        if (parsed.token !== undefined) config.value.token = parsed.token;
        if (Array.isArray(parsed.entities)) config.value.entities = parsed.entities;
      }
    } catch (e) {
      alert('JSON 格式错误，请检查后再切换模式');
      setTimeout(() => { isJsonMode.value = true; }, 0);
    }
  }
});

function addEntity() {
  config.value.entities.push({ id: '', name: '' });
}

function removeEntity(index: number) {
  config.value.entities.splice(index, 1);
}

function moveEntity(index: number, direction: number) {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < config.value.entities.length) {
    const temp = config.value.entities[index];
    config.value.entities[index] = config.value.entities[newIndex];
    config.value.entities[newIndex] = temp;
  }
}

function save() {
  if (isJsonMode.value) {
    try {
      const parsed = JSON.parse(jsonInput.value);
      if (parsed && typeof parsed === 'object') {
        config.value.url = parsed.url || '';
        config.value.token = parsed.token || '';
        config.value.entities = Array.isArray(parsed.entities) ? parsed.entities : [];
      } else {
        throw new Error('Must be an object');
      }
    } catch (e) {
      alert('JSON 格式错误，保存失败');
      return;
    }
  }
  localStorage.setItem('ha_config', JSON.stringify(config.value));
  emit('saved');
  emit('close');
}
</script>

<template>
  <div v-if="show" id="settings-modal" class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 md:p-6 z-[1000]">
    <div class="absolute top-0 left-0 right-0 bottom-0 bg-black/80" @click="emit('close')"></div>
    <div class="bg-neutral-900 p-6 md:p-8 rounded-[40px] border border-white/10 w-full max-w-2xl text-white max-h-[90vh] flex flex-col relative">
      <div class="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 class="text-2xl font-bold">Home Assistant 配置</h3>
        <div class="flex items-center gap-2">
          <button 
            @click="isJsonMode = !isJsonMode" 
            class="text-xs flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-all px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
          >
            <template v-if="!isJsonMode">
              <Code class="w-3.5 h-3.5" /> JSON 模式
            </template>
            <template v-else>
              <List class="w-3.5 h-3.5" /> 列表模式
            </template>
          </button>
          <button @click="emit('close')" class="opacity-50 hover:opacity-100 p-2">
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div class="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
        <div v-if="!isJsonMode" class="space-y-6">
          <div>
            <label class="block text-sm opacity-50 mb-2 uppercase tracking-widest">HA 地址</label>
            <input 
              v-model="config.url" 
              type="text" 
              placeholder="http://192.168.1.xxx:8123"
              class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30"
            >
          </div>
          <div>
            <label class="block text-sm opacity-50 mb-2 uppercase tracking-widest">长期访问令牌</label>
            <input 
              v-model="config.token" 
              type="password" 
              placeholder="输入令牌"
              class="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-white/30"
            >
          </div>
          
          <div class="space-y-4">
            <label class="block text-sm opacity-50 uppercase tracking-widest">设备列表</label>
            <div class="space-y-3">
              <div v-for="(entity, index) in config.entities" :key="index" class="flex gap-2">
                <div class="flex flex-col gap-1">
                  <button @click="moveEntity(index, -1)" class="p-1 opacity-30 hover:opacity-100 transition-opacity">
                    <ChevronUp class="w-4 h-4" />
                  </button>
                  <button @click="moveEntity(index, 1)" class="p-1 opacity-30 hover:opacity-100 transition-opacity">
                    <ChevronDown class="w-4 h-4" />
                  </button>
                </div>
                <input 
                  v-model="entity.id" 
                  type="text" 
                  class="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-white/30" 
                  placeholder="实体 ID"
                >
                <input 
                  v-model="entity.name" 
                  type="text" 
                  class="w-24 md:w-32 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-white/30" 
                  :placeholder="props.entitiesStates?.[entity.id]?.attributes?.friendly_name || '备注名'"
                >
                <button @click="removeEntity(index)" class="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
              <button @click="addEntity" class="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-all mt-2 bg-white/5 px-4 py-2 rounded-xl w-full justify-center border border-dashed border-white/10 hover:border-white/20">
                <PlusCircle class="w-5 h-5" />
                添加设备
              </button>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3">
          <textarea 
            v-model="jsonInput"
            rows="18"
            class="w-full bg-white/5 border border-white/10 text-white font-mono text-sm rounded-xl px-4 py-3 outline-none focus:border-white/30 custom-scrollbar"
            placeholder='{"url": "http://...", "token": "...", "entities": [{"id": "light.living_room", "name": "客厅灯"}]}'
          ></textarea>
          <div class="flex justify-between items-center text-[10px] opacity-30 px-1">
            <span>支持地址、令牌、设备列表全量导入导出</span>
            <span>格式: { "url": "...", "token": "...", "entities": [...] }</span>
          </div>
          <div class="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <p class="text-xs text-orange-200/60 leading-relaxed">
              <strong>💡 跨域提示：</strong> 如果接口无法加载，请确保在 Home Assistant 的 <code>configuration.yaml</code> 中配置了 <code>cors_allowed_origins</code>，包含当前看板的访问域名或 IP。
            </p>
          </div>
        </div>
      </div>

      <div class="pt-6 mt-2 border-t border-white/10 flex-shrink-0">
        <button @click="save" class="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-xl">
          保存并应用
        </button>
      </div>
    </div>
  </div>
</template>
