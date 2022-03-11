<template>
  <div class="form-layout horizontal">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.form-layout.horizontal {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-content: flex-start;
  flex-direction: row;
}
</style>
