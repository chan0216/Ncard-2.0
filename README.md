# Ncard

本專案參考社群網站 Dcard ，主要功能如下：<br>

1.社群功能：使用者可以瀏覽、發文及回應文章，論壇也依照內容不同分作不同討論版。<br> 2.抽卡配對功能：每日進行不重複的抽卡配對，雙方皆送出交友邀請成為好友後，即可開始聊天對話。

## Demo

Website URL : https://ncard.chandev.cc/

Test Account

Email：test@test.com

Password：test

## Technique

### Backend

- 以 Python Flask 作為後端框架
- 支援 Google 第三方登入
- 透過 JWT 實作會員驗證機制
- 透過 Nginx 進行反向代理
- 使用 Socket.io 實現即時聊天的功能
- 使用 Docker 部署專案
- 使用 S3 儲存照片，並搭配 CloudFront CDN 加快讀取速度
- 使用 RDS MySQL 儲存數據，並實現資料庫正規化
- 使用 ElastiCache Redis 存取好友列表快取

### Frontend

- HTML
- CSS
- JavaScript
- Bootstrap

## System Architecture

<img alt="architecture" src="https://github.com/chan0216/Ncard/assets/94737861/442d46ff-3959-4a3c-a9a5-61c3f34d4091">

## Database Schema

<img alt="ncard_eer" src="https://github.com/chan0216/Ncard_2.0/assets/94737861/4d51bc77-0b5f-4885-a403-ca067304d434">

## Introduction

### 社群功能

- 首頁提供文章瀏覽，可切換看板，查看熱門或最新文章

  ![home](https://github.com/chan0216/Ncard_2.0/assets/94737861/38c3fde3-6806-4fb7-ab65-da5df7ea6fdc)

- 使用者可以選擇看板發文，並對貼文留言及按讚

  ![post](https://github.com/chan0216/Ncard_2.0/assets/94737861/056778ed-b352-4420-be9d-650abc66aa6e)
  ![comment](https://github.com/chan0216/Ncard_2.0/assets/94737861/9a2a35fd-de12-4fab-8936-777802607e44)

### 抽卡配對功能

- 每到午夜十二點，符合抽卡資格者會收到系統隨機配對的匿名卡片，抽到的卡不與之前重複
- 若雙方都送出交友邀請，即可成為卡友聊天

![invite](https://github.com/chan0216/Ncard_2.0/assets/94737861/6d726eaa-02d8-4722-80cc-558ef9b3fdfb)
![chat](https://github.com/chan0216/Ncard_2.0/assets/94737861/586c3afd-e000-4998-83a2-341290041753)
