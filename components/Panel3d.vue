<template>
  <div class="flex flex-row">
    <div
      class="w-1/2 h-1/2 flex flex-row justify-center items-center shadow bg-neutral border-2 border-primary rounded-box"
      id="left-wall"
    >
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar1" /></div>
        <div><ChartsBarExample id="bar2" /></div>
      </div>
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar3" /></div>
        <div><ChartsBarExample id="bar4" /></div>
      </div>
    </div>
    <div
      class="w-1/2 h-1/2 flex flex-row justify-center items-center shadow bg-neutral border-2 border-primary rounded-box"
      id="right-wall"
    >
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar5" /></div>
        <div><ChartsBarExample id="bar6" /></div>
      </div>
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar7" /></div>
        <div><ChartsBarExample id="bar8" /></div>
      </div>
    </div>
  </div>
</template>
