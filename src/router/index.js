import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/User/Login.vue'
import Register from '@/views/User/Register.vue'
import Layout from '@/views/Layout/index.vue'
import Home from '@/views/Home/index.vue'
import Category from '@/views/Category/index.vue'
import Detail from '@/views/Detail/index.vue'
import SubCategory from '@/views/SubCategory/index.vue'
import CartList from '@/views/CartList/index.vue'
import { useUserStore } from '@/stores/user'
import Search from '@/views/Search/index.vue'
import Checkout from '@/views/Checkout/index.vue'
import Pay from '@/views/Pay/index.vue'
import PaySuccess from '@/views/Pay/PaySuccess.vue'
import Admin from '@/views/Admin/index.vue'
import AdminProduct from '@/views/Admin/components/AdminProduct.vue'
import AdminCategory from '@/views/Admin/components/AdminCategory.vue'
import AdminSubcategory from '@/views/Admin/components/AdminSubcategory.vue'
import ProductAdd from '@/views/Admin/components/Product/ProductAdd.vue'
import ProductDetail from '@/views/Admin/components/Product/ProductDetail.vue'
import Order from '@/views/Order/index.vue'
import orderDetail from '@/views/Order/components/orderDetail.vue'
import CommentLayout from '@/views/Comment/index.vue'
import CommentAdd from '@/views/Comment/component/CommentAdd.vue'
import CommentReview from '@/views/Comment/component/CommentReview.vue'
import NotFound from '@/views/ExceptionHandlePages/NotFound.vue'
import Forbidden from '@/views/ExceptionHandlePages/Forbidden.vue'
import ServerError from '@/views/ExceptionHandlePages/ServerError.vue'
import AdminOrder from '@/views/Admin/components/AdminOrder.vue'
import userInfo from '@/views/UserInfo/index.vue'
import AdminOrderDetail from '@/views/Admin/components/Order/OrderDetail.vue'

import { jwtDecode } from 'jwt-decode'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/', component: Layout,
      children: [
        { path: '', component: Home, meta: { title: 'Rabbuy - Buy what you want' } },
        { path: 'category/:id', component: Category, meta: { title: 'Rabbuy - Category' } },
        { path: 'category/sub/:id', component: SubCategory, meta: { title: 'Rabbuy - Subcategory ' } },
        { path: 'product/:id', component: Detail, meta: { title: (route) => `${route.params.productName}` } },
        { path: 'cartlist', component: CartList, meta: { title: 'Rabbuy - cartList', requiresUser: true } },
        { path: 'search', component: Search, meta: { title: 'search results' } },
        { path: 'checkout', component: Checkout, meta: { title: 'checkout' }, requiresUser: true },
        { path: 'pay/:id', component: Pay, meta: { title: 'place order', requiresUser: true } },
        { path: 'my_rabbuy', component: userInfo, meta: { title: 'My Rubbuy', requiresUser: true } },
      ]
    },

    // 支付成功页面
    { path: '/pay/success', component: PaySuccess, meta: { title: 'success' } },

    // 订单页面
    { path: '/order', component: Order, meta: { title: 'Rabbuy - Orders', requiresUser: true } },
    { path: '/order/detail/:id', component: orderDetail, meta: {title: 'Rabbuy - Order Detail', requiresUser: true}},

    // 评论页面
    {
      path: '/order/comment/', component: CommentLayout,
      children: [
        { path: '/order/comment/add/:id', component: CommentAdd, meta: { title: 'add comment', requiresUser: true } },
        { path: '/order/comment/review/:id', component: CommentReview, meta: { title: 'review comment', requiresUser: true } }
      ]
    },

    //用户登录与注册
    { path: '/login', component: Login, meta: { title: 'Rabbuy Login' } },
    { path: '/register', component: Register, meta: { title: 'Rabbuy registration' } },

    //管理员界面
    {
      path: '/admin', redirect: '/admin/order', component: Admin,
      meta: { title: 'Rabbuy admin', requiresAdmin: true },
      children: [
        { path: 'product', component: AdminProduct, },
        { path: 'category', component: AdminCategory },
        { path: 'subcategory', component: AdminSubcategory },
        { path: 'order', component: AdminOrder }
      ]
    },

    //管理员商品添加界面
    { path: '/admin/product/add', component: ProductAdd, meta: { title: 'Add product', requiresAdmin: true} },
    { path: '/admin/product/details/:id', component: ProductDetail, meta: { title: 'Product details', requiresAdmin: true }},

    // 管理员订单详情界面
    { path: '/admin/order/:id', component: AdminOrderDetail, meta: { title: 'Order Detail', requiresAdmin: true } },

    // 处理错误
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: 'Page Not Found' } },
    { path: '/403', component: Forbidden, meta: { title: 'Access Forbidden' }},
    { path: '/500', component: ServerError, meta: { title: 'Server Error' }},
  ],

  scrollBehavior() {
    return {
      top: 0
    }
  }
})

router.beforeEach((to, from, next) => {
  let title = "Rabbuy"
  if (typeof to.meta.title === 'function') {
    title = to.meta.title(to)
  } else if (to.meta.title) {
    title = to.meta.title
  }
  document.title = title

  const userStore = useUserStore()
  const isUser = !!userStore.userInfo.access
  const isAdmin = userStore.userInfo.access ? jwtDecode(userStore.userInfo.access).is_staff : false

  if (to.meta.requiresUser && !isUser) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && !isAdmin) {
    alert("This page is for admin only!")
    next('/')
  } else {
    next();
  }
})

export default router
