<script setup>
import ImageView from '@/components/ImageView/index.vue';
import { getDetailAPI, getRecommendationAPI } from '@/apis/detail';
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';
import GoodsItem from '../Home/components/GoodsItem.vue';
import { getProductCommentAPI } from '@/apis/comment';
import { getProductQuestionsAPI, submitQuestionAPI, submitAnswerAPI } from '@/apis/question';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const product = ref({});
const route = useRoute();
const router = useRouter();

const getDetail = async () => {
  try {
    const res = await getDetailAPI(route.params.id);
    product.value = res.data;
    router.replace({
      params: {
        ...route.params,
        productName: product.value.name
      }
    });
  } catch (error) {
    console.error(error);
  }
};

const randomProducts = ref([]);
const fetchRandomProducts = async (name, id) => {
  const res = await getRecommendationAPI(name, id)
  randomProducts.value = res.data;
};

// 选择商品数量
const cartStore = useCartStore()
const count = ref(1)
const handleChange = (num) => {
  count.value = num
}

const addCart = () => {
  cartStore.addToCart({
    id: product.value.id,
    name: product.value.name,
    image: product.value.images[0],
    price: product.value.price,
    count: count.value,
    status: true, // 是否正常使用
    selected: true,  // 默认标记为选中
  })
}

const comments = ref([]);

// 翻页数据
const currentPage = ref(1);
const pageSize = ref(20);
const totalComments = ref(0);

// 新增评论筛选条件
const commentFilter = ref({
  rating: 'default', // 'default': 默认, 5: 好评, 3: 中评, 1: 差评
  hasImage: false // 是否有图片
})

const getProductComment = async () => {
  const res = await getProductCommentAPI({
    productId: route.params.id,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    rating: commentFilter.value.rating,
    hasImage: commentFilter.value.hasImage
  });
  comments.value = res.data.comments;
  totalComments.value = res.data.total;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  getProductComment();
};

// 新增评论筛选方法
const filterComments = (type) => {
  switch (type) {
    case 'default':
      commentFilter.value.rating = 'default';
      break;
    case 'good':
      commentFilter.value.rating = 5;
      break;
    case 'medium':
      commentFilter.value.rating = 3;
      break;
    case 'bad':
      commentFilter.value.rating = 1;
      break;
    case 'hasImage':
      commentFilter.value.hasImage = !commentFilter.value.hasImage;
      break;
  }
  currentPage.value = 1;
  getProductComment();
}

// 问答相关数据
const questions = ref([]);
const newQuestion = ref('');
const newAnswer = ref('');
const replyToQuestion = ref(null);
const userStore = useUserStore();

// 获取商品问答
const getProductQuestions = async () => {
  try {
    const res = await getProductQuestionsAPI(route.params.id);

    // 更健壮的数据访问
    if (res && res.data && typeof res.data === 'object') {
      // 尝试获取data字段
      if ('data' in res.data) {
        questions.value = Array.isArray(res.data.data) ? res.data.data : [];
      } else {
        // 如果没有嵌套的data字段，尝试使用整个res.data
        questions.value = Array.isArray(res.data) ? res.data : [];
      }
    } else {
      console.error('Invalid response structure:', res);
      questions.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    questions.value = []; // 确保在出错时questions仍然是一个空数组
  }
};

// 提交问题
const submitQuestion = async () => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('Please login to ask a question');
    router.push('/login');
    return;
  }

  if (!newQuestion.value.trim()) {
    ElMessage.warning('Question content cannot be empty');
    return;
  }

  try {
    await submitQuestionAPI(route.params.id, newQuestion.value);
    ElMessage.success('Question submitted successfully');
    newQuestion.value = '';
    setTimeout(() => getProductQuestions(), 500);
  } catch (error) {
    console.error('Failed to submit question:', error);
    ElMessage.error('Failed to submit question');
  }
};

// 提交回答
const submitAnswer = async (questionId) => {
  if (!userStore.userInfo.id) {
    ElMessage.warning('Please login to answer the question');
    router.push('/login');
    return;
  }

  if (!newAnswer.value.trim()) {
    ElMessage.warning('Answer content cannot be empty');
    return;
  }

  try {
    await submitAnswerAPI(questionId, newAnswer.value);
    ElMessage.success('Answer submitted successfully');
    newAnswer.value = '';
    replyToQuestion.value = null;
    setTimeout(() => getProductQuestions(), 500);
  } catch (error) {
    console.error('Failed to submit answer:', error);
    ElMessage.error('Failed to submit answer');
  }
};

// 开始回答问题
const startReply = (question) => {
  replyToQuestion.value = question;
  newAnswer.value = '';
};

// 取消回答
const cancelReply = () => {
  replyToQuestion.value = null;
  newAnswer.value = '';
};

// 添加标签切换事件处理

const handleTabChange = (tab) => {
  if (tab.props?.label === 'Q&A') {
    getProductQuestions();
  } else if (tab.props?.label === 'Comments') {
    getProductComment();
  }
};

onBeforeMount( async () => {
  await getDetail();
  await fetchRandomProducts(product.value.name, product.value.id);
  await getProductComment();
  await getProductQuestions();
});

watch(
  () => route.params.productName,
  (newVal) => {
    if (newVal) {
      document.title = `Rabbuy - ${newVal}`
    }
  },
  { immediate: true }
)

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await getDetail();
      await fetchRandomProducts(product.value.name, newId);
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="xtx-goods-page">
    <div class="container">
      <div class="bread-container">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/category/${product.category?.id}` }">
            {{ product.category?.name }}
          </el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/category/sub/${product.sub_category?.id}` }">
            {{ product.sub_category?.name }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 商品信息 -->
      <div class="info-container">
        <div>
          <div class="goods-info">
            <div class="media">
              <!-- 图片预览区 -->
              <template v-if="product.images && product.images.length > 0">
                <ImageView :imageList="product.images" style="width: 100%;" />
              </template>
              <!-- 统计数量 -->
              <ul class="goods-sales">
                <li>
                  <p>Sales</p>
                  <p>100+</p>
                  <p><i class="iconfont icon-task-filling"></i>Sales</p>
                </li>
                <li>
                  <p>Comment</p>
                  <p>{{
                    product.rating_num === 0 ? 'No data' :
                    product.rating_num < 100 ? product.rating_num :
                    Math.min(Math.floor(product.rating_num / 100) * 100, 1000) + '+'
                  }}</p>
                  <p><i class="iconfont icon-comment-filling"></i>Check</p>
                </li>
                <li>
                  <p>Favorite</p>
                  <p>300+</p>
                  <p><i class="iconfont icon-favorite-filling"></i>Favorite</p>
                </li>
                <li>
                  <p>Brand Info</p>
                  <p>400+</p>
                  <p><i class="iconfont icon-dynamic-filling"></i>Pages</p>
                </li>
              </ul>
            </div>
            <div class="spec">
              <!-- 商品信息区 -->
              <p class="g-name">{{ product.name }}</p>
              <p class="g-desc">{{ product.description }}</p>
              <p class="g-price"> Price: &nbsp;
                <span>{{ product.price }}</span>
              </p>
              <p class="g-inventory">
                Inventory:
                <span v-if="product.stock_quantity <= product.low_stock_threshold" class="low-stock">
                  {{ product.stock_quantity }} only
                </span>
                <span v-else>{{ product.stock_quantity }}</span>
              </p>
              <p class="g-rating">
                Rating:
                <el-rate v-if="product.rating_num > 0"
                  v-model="product.rating"
                  disabled
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  size="large"
                  style="display: inline-block; margin-left: 8px;"
                />
                <span style="margin-left: 8px;" :style="{ color: product.rating_num > 0 ? '#FFA500' : '#000000' }">
                  {{ product.rating_num > 0 ? product.rating : 'No data' }}
                </span>
              </p>
              <div class="g-service">
                <dl>
                  <dt>On-Sale:</dt>
                  <dd>Voucher purchases go straight down to 120 yuan</dd>
                </dl>
                <dl>
                  <dt>Service</dt>
                  <dd>
                    <span>Sales Return</span>
                    <span>Refunding</span>
                    <span>Free Shipping</span>
                    <a href="javascript:;">Details...</a>
                  </dd>
                </dl>
              </div>
              <!-- sku组件 -->

              <!-- 数据组件 -->
              <p class="g-quantity">Quantity: &nbsp;
                <el-input-number v-model="count" :min="1" :max="10" @change="handleChange" />
              </p>
              <!-- 按钮组件 -->
              <div>
                <el-button
                  size="large"
                  class="btn"
                  @click="addCart"
                  :disabled="product.stock_quantity === 0"
                  :class="{ 'disabled-btn': product.stock_quantity === 0 }"
                >
                  Add to cart
                </el-button>
              </div>
            </div>
          </div>
          <div class="goods-footer">
            <div class="goods-article">
            <!-- Related Products -->
            <div class="related-products" v-if="randomProducts.length > 0">
              <h3>Recommended Products</h3>
              <div class="product-list">
                <router-link
                  v-for="good in randomProducts"
                  :key="good.id"
                  :to="{ path: `/product/${good.id}` }"
                  class="product-link"
                >
                  <GoodsItem :goods="good" />
                </router-link>
              </div>
            </div>

              <!-- 使用 el-tabs 实现标签页 -->
              <el-tabs type="border-card" @tab-change="handleTabChange">
                <!-- 产品详情 -->
                <el-tab-pane label="Details">
                  <el-empty v-if="product.details?.length === 0" description="No details provided" />
                  <div class="goods-detail" v-else>
                    <ul class="attrs">
                      <li v-for="(item, key) in product.details" :key="key">
                        <span class="dt">{{ item.key }}:</span>
                        <span class="dd">{{ item.value }}</span>
                      </li>
                    </ul>
                  </div>
                </el-tab-pane>
                <!-- 产品评论 -->
                <el-tab-pane label="Comments">
                  <!-- 评论筛选栏 -->
                  <div class="filter-bar" style="margin-bottom: 20px;">
                    <div class="left">
                      <a
                        :class="['filter-item', commentFilter.rating === 'default' ? 'active' : '']"
                        @click="filterComments('default')"
                      >Default</a>
                      <a
                        :class="['filter-item', commentFilter.rating === 5 ? 'active' : '']"
                        @click="filterComments('good')"
                      >Good</a>
                      <a
                        :class="['filter-item', commentFilter.rating === 3 ? 'active' : '']"
                        @click="filterComments('medium')"
                      >Medium</a>
                      <a
                        :class="['filter-item', commentFilter.rating === 1 ? 'active' : '']"
                        @click="filterComments('bad')"
                      >Bad</a>
                      <a
                        :class="['filter-item', commentFilter.hasImage ? 'active' : '']"
                        @click="filterComments('hasImage')"
                      >With Images</a>
                    </div>
                  </div>
                  <el-empty v-if="comments.length === 0" description="No comment yet" />
                  <ul v-else class="comments">
                    <li v-for="(comment, index) in comments" :key="index" class="comment-item">
                      <img :src="comment.user.avatar" alt="" class="avatar" />
                      <div class="comment-content">
                        <p class="username">{{ comment.user.username }}</p>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <el-rate
                            v-model="comment.rating"
                            disabled
                            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                            style="margin: 5px 0;"
                          />
                          <span style="color: #FFA500; font-size: 14px;">{{ comment.rating }}</span>
                        </div>
                        <p class="text">{{ comment.commentDesc }}</p>
                        <div class="comment-images">
                          <el-image
                            v-for="(img, imgIndex) in comment.images"
                            :key="imgIndex"
                            :src="img"
                            class="comment-image"
                            :preview-src-list="comment.images"
                            :fit="'contain'"
                            :style="{ width: '100px', height: '100px' }"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                  <el-pagination
                    v-if="totalComments > pageSize"
                    background
                    layout="prev, pager, next"
                    :page-size="pageSize"
                    :total="totalComments"
                    :current-page="currentPage"
                    @current-change="handlePageChange"
                    style="margin-top: 20px; justify-content: center;"
                  />
                </el-tab-pane>
                <!-- 新增问答标签页 -->
                <el-tab-pane label="Q&A">
                  <!-- 添加问题 -->
                  <div class="question-form">
                    <h3>Ask a Question</h3>
                    <el-input
                      v-model="newQuestion"
                      type="textarea"
                      :rows="2"
                      placeholder="Ask about this product..."
                      style="margin-bottom: 10px;"
                    />
                    <el-button type="primary" @click="submitQuestion" :disabled="!newQuestion.trim()">
                      Submit Question
                    </el-button>
                  </div>

                  <!-- 问题列表 -->
                  <div class="questions-container" style="margin-top: 30px;">
                    <h3>Product Questions</h3>
                    <el-empty v-if="!questions || questions.length === 0" description="No questions yet" />
                    <div v-else class="question-list">
                      <div v-for="(question, qIndex) in questions" :key="qIndex" class="question-item">
                        <div class="question-header">
                          <div class="user-info">
                            <img :src="question.user?.profile_picture || ''" alt="" class="avatar" />
                            <span class="username">{{ question.user?.username || 'Anonymous' }}</span>
                          </div>
                          <span class="question-time">{{ new Date(question.created_time || Date.now()).toLocaleString() }}</span>
                        </div>
                        <div class="question-content">
                          <p class="question-text">{{ question.content || '' }}</p>

                          <!-- 回答列表 -->
                          <div class="answers-container" v-if="question.answers && question.answers.length > 0">
                            <div v-for="(answer, aIndex) in question.answers" :key="aIndex" class="answer-item">
                              <div class="answer-header">
                                <div class="user-info">
                                  <img :src="answer.user?.profile_picture || ''" alt="" class="avatar" />
                                  <span class="username">{{ answer.user?.username || 'Anonymous' }}</span>
                                </div>
                                <span class="answer-time">{{ new Date(answer.created_time || Date.now()).toLocaleString() }}</span>
                              </div>
                              <p class="answer-text">{{ answer.content || '' }}</p>
                            </div>
                          </div>

                          <!-- 回答问题表单 -->
                          <div v-if="replyToQuestion && replyToQuestion.question_id === question.question_id" class="reply-form">
                            <el-input
                              v-model="newAnswer"
                              type="textarea"
                              :rows="2"
                              placeholder="Write your answer..."
                              style="margin-bottom: 10px; margin-top: 15px;"
                            />
                            <div class="reply-actions">
                              <el-button type="primary" @click="submitAnswer(question.question_id)" :disabled="!newAnswer.trim()">
                                Submit Answer
                              </el-button>
                              <el-button @click="cancelReply">Cancel</el-button>
                            </div>
                          </div>

                          <!-- 回答按钮 -->
                          <div v-else class="question-actions">
                            <el-button type="primary" plain @click="startReply(question)" size="small">
                              Answer this question
                            </el-button>
                            <span class="answer-count" v-if="question.answers_count && question.answers_count > 0">
                              {{ question.answers_count }} answer(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<style scoped lang="scss">
.xtx-goods-page {
  .goods-info {
    min-height: 600px;
    background: #fff;
    display: flex;

    .media {
      width: 580px;
      height: 600px;
      padding: 30px 50px;
    }

    .spec {
      flex: 1;
      padding: 30px 30px 30px 0;
    }
  }

  .goods-footer {
    display: flex;
    width: 100%;
    margin-top: 20px;
    flex-wrap: wrap;

    .goods-article {
      width: 100%;
    }
  }

  .goods-tabs {
    min-height: 200px;
    background: #fff;
    max-height: 600px;
  }

  .goods-warn {
    min-height: 600px;
    background: #fff;
    margin-top: 20px;
  }

  .number-box {
    display: flex;
    align-items: center;

    .label {
      width: 60px;
      color: #999;
      padding-left: 10px;
    }
  }

  .g-name {
    font-size: 22px;
  }

  .g-desc {
    color: #999;
    margin-top: 10px;
  }

  .g-price {
    margin-top: 10px;
    font-size: 16px;

    span {
      color: $priceColor;
      margin-right: 10px;
      font-size: 20px;

      &::before {
        content: "¥";
        font-size: 18px;
      }
    }
  }

  .g-inventory {
    margin-top: 10px;
    font-size: 16px;

    .low-stock {
      color: #f33c3c;
    }
  }

  .g-rating {
    margin-top: 10px;
    font-size: 16px;
  }

  .g-service {
    background: #f5f5f5;
    width: 500px;
    padding: 20px 10px 0 10px;
    margin-top: 10px;

    dl {
      padding-bottom: 20px;
      display: flex;
      align-items: center;

      dt {
        width: 70px;
        color: #999;
      }

      dd {
        color: #666;

        &:last-child {
          span {
            margin-right: 10px;

            &::before {
              content: " • ";
              color: $xtxColor;
              margin-right: 2px;
            }
          }

          a {
            margin-left: 10px;
            color: $xtxColor;
          }
        }
      }
    }
  }

  .g-quantity{
    margin-top: 30px;
    font-size: 14px;
  }

  .goods-sales {
    display: flex;
    width: 400px;
    align-items: center;
    text-align: center;
    height: 140px;

    li {
      flex: 1;
      position: relative;

      ~li::after {
        position: absolute;
        top: 10px;
        left: 0;
        height: 60px;
        border-left: 1px solid #e4e4e4;
        content: "";
      }

      p {
        &:first-child {
          color: #999;
        }

        &:nth-child(2) {
          color: $priceColor;
          margin-top: 10px;
        }

        &:last-child {
          color: #666;
          margin-top: 10px;

          i {
            color: $xtxColor;
            font-size: 14px;
            margin-right: 2px;
          }

          &:hover {
            color: $xtxColor;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.goods-tabs {
  min-height: 600px;
  background: #fff;

  nav {
    height: 70px;
    line-height: 70px;
    display: flex;
    border-bottom: 1px solid #f5f5f5;

    a {
      padding: 0 40px;
      font-size: 18px;
      position: relative;

      >span {
        color: $priceColor;
        font-size: 16px;
        margin-left: 10px;
      }
    }
  }
}

.goods-detail {
  padding: 40px;

  .attrs {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;

    li {
      display: flex;
      margin-bottom: 10px;
      width: 50%;

      .dt {
        width: 100px;
        color: #999;
      }

      .dd {
        flex: 1;
        color: #666;
      }
    }
  }

  >img {
    width: 100%;
  }
}

.btn {
  margin-top: 30px;
  background-color: $xtxColor;
  color: #fff;

  &.disabled-btn {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.bread-container {
  padding: 25px 0;
}

.related-products {
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;

  h3 {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }
}

.comments {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .comment-item {
    display: flex;
    align-items: flex-start;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px;

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .comment-content {
      flex: 1;

      .username {
        font-weight: bold;
        margin: 0;
        font-size: 18px;
      }

      .text {
        margin: 0 0 10px 0;
        font-size: 15px;
      }

      .comment-images {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        margin-top: 5px;
        width: 300px;
      }

      .comment-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 0 25px;

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-item {
    position: relative;
    cursor: pointer;
    color: #333;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &:hover, &.active, &.active::after {
      color: $xtxColor;
      border: 1px solid $xtxColor;
    }
  }
}

// 问答相关样式
.question-form {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.question-list {
  margin-top: 20px;
}

.question-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  background-color: #fff;
}

.question-header, .answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-weight: bold;
  font-size: 14px;
}

.question-time, .answer-time {
  color: #909399;
  font-size: 12px;
}

.question-text {
  font-size: 16px;
  margin-bottom: 15px;
}

.question-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
}

.answer-count {
  color: #909399;
  font-size: 12px;
}

.answers-container {
  margin-top: 10px;
  margin-left: 20px;
  border-left: 2px solid #f0f0f0;
  padding-left: 15px;
}

.answer-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.answer-text {
  font-size: 14px;
}

.reply-form {
  margin-top: 15px;
}

.reply-actions {
  display: flex;
  gap: 10px;
}
</style>
