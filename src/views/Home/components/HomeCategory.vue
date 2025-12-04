<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getHomeBannerAPI } from '@/apis/home'

const categoryList = ref([]);

const getHomeBanner = async () => {
  const res = await getHomeBannerAPI();
  categoryList.value = res.data;
}

onMounted(() => {
  getHomeBanner()
})

</script>

<template>
  <div class="home-category">
    <ul class="menu">
      <li v-for="item in categoryList" :key="item.id">
        <RouterLink :to="`/category/${item.id}`">{{ item.name }}: </RouterLink>
        <template v-for="(child, index) in item.children" :key="child.id">
          <RouterLink
            :to="`/category/sub/${child.id}`"
            class="sub-link"
          >
            {{ child.name.length > 13 ? child.name.split(' ')[0] + '...' : child.name }}
          </RouterLink>
          <span v-if="index !== item.children.length - 1" class="divider"> / </span>
        </template>
        <div class="layer">
          <h4>For Your Page <small>Hot sale are discounted</small></h4>
          <ul>
            <li v-for="product in item.products" :key="product.id">
              <RouterLink :to="`/product/${product.id}`">
                <div class="good-item">
                  <img :src="product.image" alt="" />
                  <div class="info">
                    <p class="name ellipsis-2">{{ product.name }}</p>
                    <p class="price"><i>¥</i>{{ product.price }}</p>
                  </div>
                </div>
              </RouterLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.home-category {
  width: 250px;
  height: 500px; /* 修改为 auto，以便根据内容自适应高度 */
  background: rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 99;
  border-top-left-radius: 10px; /* 添加左上圆角 */
  border-bottom-left-radius: 10px; /* 添加左下圆角 */

  .menu {
    li {
      padding-left: 10px;
      line-height: 55px;

      &:hover {
        background: #444; /* Hover background color */
        border-top-left-radius: 10px; /* 添加左上圆角 */
        border-bottom-left-radius: 10px; /* 添加左下圆角 */
      }

      a {
        margin-right: 4px;
        color: #fff;

        &:first-child {
          font-size: 16px;
        }

        &:hover {
          text-decoration: underline;
        }
      }

      .divider {
        color: #fff;
      }

      .layer {
        width: 700px; /* Adjust width as needed */
        height: 500px;
        background: rgba(255, 255, 255, 0.8);
        position: absolute;
        left: 250px;
        top: 0;
        display: none;
        padding: 10px;

        h4 {
          font-size: 20px;
          font-weight: normal;
          line-height: 30px;

          small {
            font-size: 14px;
            color: #666;
          }
        }

        ul {
          display: flex;
          flex-wrap: wrap; /* 允许换行 */
          gap: 10px; /* 增加间距 */


          li {
            width: calc(25% - 10px); /* 设置宽度为 50% 减去间距 */
            margin-bottom: 10px; /* 增加底部间距 */
            border: 1px solid #eee;
            border-radius: 4px;
            background: #fff;
            display: flex;
            justify-content: center;

            a {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 5px;

              .good-item {
                flex-direction: column;
                display: flex;
                justify-content: center;

                img {
                  width: 80px;
                  height: 80px; /* 设置为正方形 */
                  border-radius: 4px; /* 可选：让图片有圆角 */
                  object-fit: cover; /* 确保图片填充 */
                  margin-bottom: 5px; /* 增加图片与文本之间的间距 */
                  justify-content: center;
                }

                .info {
                  text-align: center;

                  .name {
                    font-size: 14px;
                    color: #333;
                  }

                  .price {
                    font-size: 16px;
                    color: #f00;

                    i {
                      font-size: 14px;
                    }
                  }
                }
              }
            }
          }
        }
      }

      &:hover {
        .layer {
          display: block;
        }
      }
    }
  }
}
</style>
