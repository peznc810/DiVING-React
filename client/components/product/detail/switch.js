import { useState } from 'react'

import Stars from '@/components/product/star/star'
import ProductRecommond from '@/components/product/detail/product-recommond'
import Link from 'next/link'

export default function Switch() {
  const [isSwitchOn, setIsSwitchOn] = useState(false)

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn)
  }
  return (
    <div className="mt-4">
      {/* 轉換按鈕 -- 商品介紹/評價 */}
      <div className="form-check form-switch d-flex justify-content-end">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault"
          checked={isSwitchOn}
          onChange={handleSwitchToggle}
        />
        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
          {isSwitchOn ? '評價' : '細節'}
        </label>
      </div>
      {isSwitchOn && (
        <div>
          {/* 顯示顧客評價 */}
          <h3 className="text-center my-2">顧客評價</h3>
          <div className="container">
            <form>
              <div className="form-group">
                <label className="mx-2" for="exampleFormControlTextarea1">
                  來為 --- 評價吧～
                </label>
                <Stars />
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder="請撰寫評價"
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary d-flex btn-comment"
              >
                送出評價
              </button>
            </form>
          </div>

          {/* 用戶評價 */}
          <div className="containermt-5 d-flex align-items-center justify-content-center">
            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="avatar">
                  <img src="/images/product/test/20/1-1.webp" alt="..." />
                </div>
                <div className="content">
                  <h6>安妮雅 2024/01/01</h6>
                  <Stars />
                  <p>
                    若沒有潛水的存在，那麼後果可想而知。亦舒曾經說過，人生短短數十載，最要緊的是滿足自己，不是討好他人。這影響了我的價值觀。
                  </p>
                </div>
              </div>

              <hr />
              <button
                type="submit"
                className="btn btn-primary d-flex btn-comment"
              >
                更多評價
              </button>
            </div>
          </div>

          {/* 隨機商品 */}
          <div>
            <h3 className="text-center my-5">你可能會喜歡的商品⋯</h3>
            <ProductRecommond />
          </div>
        </div>
      )}
      {!isSwitchOn && (
        <div>
          {/* 顯示商品細節 */}
          <h3 className="text-center my-2">商品介紹</h3>

          {/* 商品介紹 */}
          <div className="row mt-2 mx-2">
            <div className="col-sm-12">
              <p className="text-center my-3 font-weight-light">
                鞋面採用車縫皮革裝飾片，全面提升經典指標性、耐久性和支撐力。
              </p>
              <div>
                <div className="p-2 my-3 custom-image-container">
                  <img src="/images/product/test/20/20-detail1.jpg" />
                  {/* `${}` */}
                </div>
                <div className="p-2 my-3 custom-image-container">
                  <img src="/images/product/test/20/20-detail1.jpg" />
                  {/* `${}` */}
                </div>
                <div className="p-2 my-3 custom-image-container">
                  <img src="/images/product/test/20/20-detail1.jpg" />
                  {/* `${}` */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
      .form-check-input{
        width: 40px;
        height:20px;
      }
      .btn-comment {
          background-color: #265475;
          margin: 18px auto;
          border-radius: 100px;
          padding: 10px 20px;
        }
      .custom-image-container {
          margin: 0 auto;
          width: 600px;
          height: 480px;
        }
        .custom-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .content {
          height: 80px;
        }
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          margin: 15px;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  )
}