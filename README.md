![OAuth](https://github.com/huanchin/Node.js-OAuth/assets/19501051/04281d66-56a1-47f6-b5ee-8661a7d225ba)

## 實際上的執行順序分成兩種情況：

1. 使用者目前的瀏覽器目前是未登入網站的狀態，所以發送到伺服器的 HTTP reqeust 中不會帶有 cookie。

2. 使用者目前的瀏覽器目前是已經登入網站的狀態，所以發送到伺服器的 HTTP reqeust 中有 cookie。




## 情況一：

1. 使用者嘗試進入 /profile 的話，會被 authCheck 導向到登入頁面。使用者按下「透過Google登入」後，會進入 Google Strategy 的 callback function。

2. 在 callback function 內部，伺服器會自動確認是否需要儲存使用者資訊到資料庫中。

3. 確認完畢後，Google Strategy 的 callback function 會執行done()。此 done() 的功能是執行 serializeUser()。

4. serializeUser() 中的 done() 的功能是將 mongoDB 的 id 存在session。並且以 cookie 的形式給使用者。此時使用者的瀏覽器是已經登入網站的狀態，所以發送到伺服器的 HTTP reqeust 中有 cookie。

5. serializeUser() 內部的 done() 執行完畢後，Google 伺服器會將使用者導向到 /google/redirect 這個 route。router.get("/google/redirect") 這段程式碼中的 res.redirect("/profile") 會要求使用者重新發送 HTTP request。

6. 使用者者重新發送 HTTP request 時，cookie 會被 app.use(passport.session()) 發現。app.use(passport.session()) 會執行 deserializeUser()。deserializeUser() 內的 done() 會設定 req.user 為使用者在資料庫內的資料，並且設定 req.isAuthenticated() 是 true。

7. 使用者可以通過 authCheck，所以可以使用 /profile 這個 route 了！




## 情況二：

1. 使用者嘗試進入 /profile 的話，因為 app.use(passport.session()) 是在 app.use("/profile", profileRoute) 之前，所以cookie 會被 app.use(passport.session()) 發現。app.use(passport.session()) 會執行 deserializeUser()。deserializeUser() 內的 done() 會設定 req.user 為使用者在資料庫內的資料，並且設定 req.isAuthenticated() 是 true。

2. 使用者可以通過 authCheck，所以可以使用 /profile 這個 route。



### 這段程式碼：
```
app.use(
 session({
 secret: process.env.SECRET,
 resave: false,
 saveUninitialized: true,
})
);
```
的功能是設定 cookie 的簽名方式。cookie 可能在客戶端被篡改，所以需要先給透過 HMAC 演算法對 cookie 做簽名，才能發送 cookie 給客戶端。HMAC 演算法需要使用 secret 參數，所以需要在上面這段程式碼做設定。設定完成後，serializeUser() 內部的 done() 在發送 cookie 之前，會使用這段程式碼所設定的 secret 參數對 cookie 做簽名，再傳送給使用者。
