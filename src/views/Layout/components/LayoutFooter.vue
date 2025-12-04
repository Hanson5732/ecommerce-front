<script setup>

</script>

<template>
    <footer class="app_footer">
      
      <div class="contact">
        <div class="container">
          <dl>
            <dt>Customer Service</dt>
            <dd><i class="iconfont icon-kefu"></i>Contact Us</dd>
            <dd><i class="iconfont icon-question"></i>Feedback</dd>
          </dl>
          <dl>
            <dt>Follow Us</dt>
            <dd><i class="iconfont icon-weixin"></i>WeChat</dd>
            <dd><i class="iconfont icon-weibo"></i>Sina Blog</dd>
          </dl>
          <dl>
            <dt>Download App</dt>
            <dd class="qrcode"><img src="@/assets/images/qrcode.jpg" /></dd>
            <dd class="download">
              <span>Scan QR code</span>
              <span>Come and join us</span>
              <a href="javascript:;">App Store</a>
            </dd>
          </dl>
          <dl>
            <dt>Hotline</dt>
            <dd class="hotline">400-0000-000 <small>Mon-Sun 8:00-18:00</small></dd>
          </dl>
        </div>
      </div>

      <div class="extra">
        <div class="container">
          <div class="slogan">
            <a href="javascript:;">
              <i class="iconfont icon-footer01"></i>
              <span>Low Price</span>
            </a>
            <a href="javascript:;">
              <i class="iconfont icon-footer02"></i>
              <span>Fast Logistics</span>
            </a>
            <a href="javascript:;">
              <i class="iconfont icon-footer03"></i>
              <span>Fresh Quality</span>
            </a>
          </div>
          
          <div class="copyright">
            <p>
              <a href="javascript:;">About Us</a>
              <a href="javascript:;">Help Center</a>
              <a href="javascript:;">After-Sale</a>
              <a href="javascript:;">Delivery</a>
              <a href="javascript:;">Cooperation</a>
              <a href="javascript:;">Suggestions</a>
              <a href="javascript:;">Links</a>
            </p>
            <p>CopyRight © Rabbuy</p>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <style scoped lang='scss'>
  .app_footer {
    overflow: hidden;
    background-color: #f5f5f5;
    padding-top: 20px;
  
    .contact {
      background: #fff;
  
      .container {
        padding: 60px 0 40px 25px;
        display: flex;
      }
  
      dl {
        height: 190px;
        text-align: center;
        padding: 0 72px;
        border-right: 1px solid #f2f2f2;
        color: #999;
  
        &:first-child {
          padding-left: 0;
        }
  
        &:last-child {
          border-right: none;
          padding-right: 0;
        }
      }
  
      dt {
        line-height: 1;
        font-size: 18px;
      }
  
      dd {
        margin: 36px 12px 0 0;
        float: left;
        width: 92px;
        height: 92px;
        padding-top: 10px;
        border: 1px solid #ededed;
  
        .iconfont {
          font-size: 36px;
          display: block;
          color: #666;
        }
  
        &:hover {
          .iconfont {
            color: $xtxColor;
          }
        }
  
        &:last-child {
          margin-right: 0;
        }
      }
  
      .qrcode {
        width: 92px;
        height: 92px;
        padding: 7px;
        border: 1px solid #ededed;
      }
  
      .download {
        padding-top: 5px;
        font-size: 14px;
        width: auto;
        height: auto;
        border: none;
  
        span {
          display: block;
        }
  
        a {
          display: block;
          line-height: 1;
          padding: 10px 25px;
          margin-top: 5px;
          color: #fff;
          border-radius: 2px;
          background-color: $xtxColor;
        }
      }
  
      .hotline {
        padding-top: 20px;
        font-size: 22px;
        color: #666;
        width: auto;
        height: auto;
        border: none;
  
        small {
          display: block;
          font-size: 15px;
          color: #999;
        }
      }
    }
  
    .extra {
      background-color: #333;
    }
  
    .slogan {
      height: 178px;
      line-height: 58px;
      padding: 60px 100px;
      border-bottom: 1px solid #434343;
      display: flex;
      justify-content: space-between;
  
      a {
        height: 58px;
        line-height: 58px;
        color: #fff;
        font-size: 28px;
  
        i {
          font-size: 50px;
          vertical-align: middle;
          margin-right: 10px;
          font-weight: 100;
        }
  
        span {
          vertical-align: middle;
          text-shadow: 0 0 1px #333;
        }
      }
    }
  
    .copyright {
      height: 170px;
      padding-top: 40px;
      text-align: center;
      color: #999;
      font-size: 15px;
  
      p {
        line-height: 1;
        margin-bottom: 20px;
      }
  
      a {
        color: #999;
        line-height: 1;
        padding: 0 10px;
        border-right: 1px solid #999;
  
        &:last-child {
          border-right: none;
        }
      }
    }
  }
  </style>