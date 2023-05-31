<template>
  <NavBar class="bg-base-100 " />
  <div class="drawer">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <Scene class="bg-base-200 w-full h-full" />
    </div>
    <div class="drawer-side">
      <SideBar />
    </div>
  </div>
</template>