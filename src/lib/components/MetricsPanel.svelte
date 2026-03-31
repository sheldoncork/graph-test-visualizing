<script lang="ts">
  import DefUseMarker from './DefUseMarker.svelte';
  import CoverageControl from './CoverageControl.svelte';

  let activeTab = 'duPair';
</script>

<div class="metrics-panel">
  <div class="panel-tabs">
    <button
      class="tab-btn"
      class:active={activeTab === 'duPair'}
      on:click={() => (activeTab = 'duPair')}
    >
      DU-Pair
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'control'}
      on:click={() => (activeTab = 'control')}
    >
      Calculate
    </button>
  </div>

  <div class="panel-content">
    {#if activeTab === 'duPair'}
      <DefUseMarker />
    {:else}
      <CoverageControl />
    {/if}
  </div>
</div>

<style>
  .metrics-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

  .panel-tabs {
    display: flex;
    gap: 0;
    background: white;
    border-bottom: 1px solid var(--border-color);
  }

  .tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: white;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    color: #666;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: #f9f9f9;
    color: var(--primary-color);
  }

  .tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
</style>
