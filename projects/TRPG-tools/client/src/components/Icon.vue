<template>
  <i :class="`iconfont icon-${name}`"></i>
</template>

<script>
  export default {
    name: 'lh-icon',
    props: {
      name: {
        type: String,
        required: true,
      },
    },
  };
</script>

<style>
  @font-face {
    font-family: "iconfont";
    src: url('//at.alicdn.com/t/font_397375_i6pco5ex1ptfyldi.eot?t=1498201152271');
    src: url('//at.alicdn.com/t/font_397375_i6pco5ex1ptfyldi.woff?t=1498201152271') format('woff'),
    url('//at.alicdn.com/t/font_397375_i6pco5ex1ptfyldi.ttf?t=1498201152271') format('truetype');
  }

  .iconfont {
    font-family: "iconfont" !important;
    font-style: normal;
    vertical-align: baseline;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: inline-block;
  }

  .icon-loading {
    animation: rotating 1s linear infinite;
  }

  @keyframes rotating {
    0% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }

  .icon-loading:before {
    content: "\eb0f";
  }

  .icon-xiaoxi:before {
    content: "\e681";
  }

  .icon-touzi:before {
    content: "\e62b";
  }
</style>
