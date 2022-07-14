import Vue from "vue";
import VueRouter from "vue-router";
// import home from "../views/Myhome";
const home = () =>
    import ("../views/Myhome");
// import login from "../views/Mylogin";
const login = () =>
    import ("../views/Mylogin");
// import roles from "../components/power/Shop-roles";
const roles = () =>
    import ("../components/power/Shop-roles");
// import rights from "../components/power/Shop-rights";
const rights = () =>
    import ("../components/power/Shop-rights");
// import goods from "../components/goods/Shop-goods";
const goodlist = () =>
    import ("../components/goods/Shop-goodList");
// import cate from "../components/roots/Shop-roots";
const cate = () =>
    import ("../components/goods/Shop-cate");
// import users from "../components/users/Shop-users";
const params = () =>
    import ("../components/goods/Shop-params");
const users = () =>
    import ("../components/users/Shop-users");
import wellcome from "../views/Wellcome";
const order = () =>
    import ("../components/order/Shop-order");
const report = () =>
    import ("../components/report/Shop-report");
const add = () =>
    import ("../components/goods/Shop-add");

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        { path: "/", redirect: "/login" },
        { path: "/login", component: login },
        {
            path: "/home",
            component: home,
            redirect: "/wellcome",
            children: [
                { path: "/wellcome", component: wellcome },
                { path: "/roles", component: roles },
                { path: "/goods", component: goodlist },
                { path: "/params", component: params },
                { path: "/rights", component: rights },
                { path: "/categories", component: cate },
                { path: "/users", component: users },
                { path: "/orders", component: order },
                { path: "/reports", component: report },
                { path: "/goods/add", component: add },
            ],
        },
    ],
});
router.beforeEach((to, from, next) => {
    if (to.path === "/login") return next();
    const tokenStr = window.sessionStorage.getItem("token");
    if (!tokenStr) return next("login");
    next();
});

//↓↓↓↓↓↓↓↓↓↓ 解决重复点击路由报错问题：NavigationDuplicated: Avoided redundant navigation to current location: "/xxx". 开始 ↓↓↓↓↓↓↓↓↓↓//
const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};
//↑↑↑↑↑↑↑↑↑↑ 解决重复点击路由报错问题：NavigationDuplicated: Avoided redundant navigation to current location: "/xxx". 结束 ↑↑↑↑↑↑↑↑↑↑//

export default router;

//路由导航守卫
// router.beforeEach((to, from, next) => {
//     if(to.path==='/login')return next()
//     const dataStr = window.sessionStorage.getItem('token')
//     if(!dataStr) return next('/login')
//     next()
// })