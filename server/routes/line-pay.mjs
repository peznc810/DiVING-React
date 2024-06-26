import express from 'express';
const router = express.Router();

import db from '../db.mjs';
import 'dotenv/config.js'

import { createLinePayClient } from 'line-pay-merchant'

import { v4 as uuidv4 } from 'uuid'

const linePayClient = createLinePayClient({
  channelId: process.env.LINE_PAY_CHANNEL_ID,
  channelSecretKey: process.env.LINE_PAY_CHANNEL_SECRET,
  env: process.env.NODE_ENV,
})

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router.post("/create-order", async(req, res)=>{
  const userId = req.body.user_id
  const orderId =Date.now()
  const packgeId = uuidv4()

  const { totalPrice, lineProducts, products, receiver, order_note, shipment,usingCoupon } = req.body;

  //傳送給line pay的資料
  const order = {
    orderId: orderId,
    currency: "TWD",
    amount: totalPrice,
    packages: [
      {
        id: packgeId,
        amount: totalPrice,
        products: lineProducts,
      },
    ],
    options:{ display: {locale:"zh_TW"}},
  }

  //寫入資料庫的資料 order
  const dbOrder = {
    id: orderId,
    user_id : userId,
    total_price : totalPrice,
    payment: "Line pay",
    shipping: shipment,
    status: "建立成功",
    receiver : JSON.stringify(receiver),
    order_info: JSON.stringify(order),
    usingCoupon: JSON.stringify(usingCoupon),
    order_note,
  }

  addOrder(dbOrder)

  // 寫入資料庫的資料 order_detail
  products.forEach(({ product_id, lesson_id, order_time, product_detail, num }) => {
    const dbOrderDetail = {
      order_id: orderId,
      product_id,
      lesson_id,
      order_time,
      product_detail,
      num,
    };
    addOrderDetail(dbOrderDetail);
  });

  res.json({status: "success", data: {order},dbOrder :{dbOrder}})
})

router.get("/reserve", async (req, res) => {
  try {
    if (!req.query.orderId) {
      return res.json({ status: "error", message: "order id不存在" });
    }

    const orderId = req.query.orderId;
    const redirectUrls = {
      confirmUrl: process.env.REACT_REDIRECT_CONFIRM_URL,
      cancelUrl: process.env.REACT_REDIRECT_CANCEL_URL,
    };

    const [[orderRecord]] = await getOrder(orderId);
    if (!orderRecord) {
      return res.status(400).json({ status: "error", message: "無法找到該訂單" });
    }

    const order = JSON.parse(orderRecord.order_info);

    const linePayResponse = await linePayClient.request.send({
      body: { ...order, redirectUrls },
    });

    const reservation = {
      ...order,
      returnCode: linePayResponse.body.returnCode,
      returnMessage: linePayResponse.body.returnMessage,
      transactionId: linePayResponse.body.info.transactionId,
      paymentAccessToken: linePayResponse.body.info.paymentAccessToken,
    };

    await updateOrder(JSON.stringify(reservation), reservation.transactionId, orderId);
    
    res.redirect(linePayResponse.body.info.paymentUrl.web);
  } catch (error) {
    console.log("發生錯誤", error);
    res.status(500).json({ status: "error", message: "伺服器錯誤" });
  }
});

router.get("/confirm", async (req, res) => {
  try {
    const transactionId = req.query.transactionId;

    const [[dbOrder]] = await getOrderByTid(transactionId);
    if (!dbOrder) {
      return res.status(400).json({ status: "error", message: "無法找到該訂單" });
    }

    if(dbOrder.return_code === "0000"){
      return res.json({ status: 'repeat'});
    }

    const transaction = JSON.parse(dbOrder.reservation);
    const amount = transaction.amount;

    const linePayResponse = await linePayClient.confirm.send({
      transactionId,
      body: {
        currency: 'TWD',
        amount,
      },
    });

    let status = linePayResponse.body.returnCode === '0000' ? '付款成功' : 'fail';

    await updateOrderStatus(status, linePayResponse.body.returnCode, JSON.stringify(linePayResponse.body), dbOrder.id);

    return res.json({ status: 'success', data: linePayResponse.body });
  } catch (error) {
    console.log("錯誤", error);
    return res.status(500).json({ status: "fail", message: "伺服器錯誤" });
  }
});

function getOrder(orderId) {
  return new Promise(async (resolve, reject) => {
    const result = await db.execute(
      'SELECT * FROM `order` WHERE `id` = ?',[orderId]
    );
    if (result) {
      resolve(result)
    } else {
      reject({ status: "error", msg: "err" })
    }
  })
}

function getOrderByTid(transactionId) {
  return new Promise(async (resolve, reject) => {
    const result = await db.execute(
      'SELECT * FROM `order` WHERE `transaction_id` = ?',[transactionId]
    );
    if (result) {
      resolve(result)
    } else {
      reject({ status: "error", msg: "err" })
    }
  })
}

function updateOrder(reservation, transaction_id, orderId){
  console.log(reservation, transaction_id, orderId);

  return db.execute("UPDATE `order` SET `reservation` = ?, `transaction_id` = ? WHERE `id` =?;",[reservation, transaction_id, orderId])
}

function updateOrderStatus(status, return_code, confirm, orderId) {
  return db.execute("UPDATE `order` SET `status` = ?, `return_code` = ?, `confirm` = ? WHERE `id` = ?;", [status, return_code, confirm, orderId]);
}

function addOrder(dbOrder){
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const datetimeNow = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return new Promise((resolve, reject) => {
    db.execute(
      'INSERT INTO `order`(id, user_id, total_price, payment, shipping, used_coupon, status, receiver, order_info, created_at, order_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',[
        dbOrder.id, dbOrder.user_id, dbOrder.total_price, dbOrder.payment, dbOrder.shipping, dbOrder.usingCoupon, dbOrder.status, dbOrder.receiver, dbOrder.order_info, datetimeNow ,dbOrder.order_note
      ]
    ).then(([result]) => {
      if (result) {
        resolve(result);
      } else {
        reject({ status: "error", msg: "err" });
      }
    })
    .catch(error => {
      console.error(error);
      reject({ status: "error", msg: error.message });
    });
    
  })
}

function addOrderDetail(dbOrderDetail) {
  return new Promise((resolve, reject) => {
    let sql = '';
    let values = [];

    if (dbOrderDetail.product_id) {
      sql = 'INSERT INTO `order_detail`(order_id, product_id, product_detail, num) VALUES (?, ?, ?, ?);';
      values = [dbOrderDetail.order_id, dbOrderDetail.product_id, dbOrderDetail.product_detail, dbOrderDetail.num];
    } else if (dbOrderDetail.lesson_id) {
      sql = 'INSERT INTO `order_detail`(order_id, lesson_id, num, order_time) VALUES (?, ?, ?, ?);';
      values = [dbOrderDetail.order_id, dbOrderDetail.lesson_id, dbOrderDetail.num, dbOrderDetail.order_time];
    } else {
      reject({ status: "error", msg: "Missing product_id or lesson_id" });
      return;
    }

    db.execute(sql, values)
      .then(([result]) => {
        if (result) {
          resolve(result);
        } else {
          reject({ status: "error", msg: "Insertion failed" });
        }
      })
      .catch(error => {
        reject({ status: "error", msg: error.message });
      });
  });
}

export default router