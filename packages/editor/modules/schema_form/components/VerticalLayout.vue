<template>
  <div class="form-layout vertical">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.form-layout.vertical {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-content: flex-start;
  flex-direction: column;
}
</style>
