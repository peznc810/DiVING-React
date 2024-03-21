import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Button, Stack, Image } from 'react-bootstrap'
import DiButton from '@/components/post/defaultButton'
import { FaWind } from 'react-icons/fa'
import { TiWeatherCloudy } from 'react-icons/ti'
import { LuWaves } from 'react-icons/lu'
import ImageViewModal from '@/components/map/imageViewModal'
import styles from './svg.module.scss'
import TaiwanSvg from '@/components/map/taiwanSvg'

// const AUTHORIZATION_KEY = process.env.AUTHORIZATION_KEY
const AUTHORIZATION_KEY = 'CWA-12A9C569-394E-4169-AD84-A7592FBBEAF1'

export default function Test() {
  const [mapData, setMapData] = useState([])
  const [aboutData, setAboutData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedDis, setSelectedDis] = useState(null) //被選的區的id
  const [selectedDisName, setSelectedDisName] = useState('請點選地圖區域') //被選的區名 用來放標題
  const [disData, setDisData] = useState([]) //單個區的資料
  const [selectPoint, setSelectPointData] = useState([]) //被選的潛點的id
  const [selectedPointData, setSelectedPointData] = useState(null) //單潛點的資料

  //改變潛點樣式用
  const [pointStyle, setPointStyle] = useState('')

  // 圖片放大及關閉
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  // 取得data
  const getMap = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/map')
      const data = await res.json()

      if (data) {
        // 設定到狀態
        const { mapData, aboutData } = data
        setMapData(mapData)
        setAboutData(aboutData)

        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    } catch (e) {
      console.error('Error fetching data from the server:', e)
    }
  }

  useEffect(() => {
    getMap()
  }, [])

  useEffect(() => {
    if (selectedDis) {
      //有區的id的話 改變單區的資料
      const filteredMapData = mapData.filter((item) => item.id === selectedDis)
      setDisData(filteredMapData)

      //抓到區的id然後去對照about的資料中map_id等於前者的資料
      const pointData = aboutData.filter((item) => item.map_id === selectedDis)
      setSelectedPointData(pointData) //改變單潛點的資料
    }
  }, [selectedDis])

  // 點擊地圖
  const handleMapClick = (e) => {
    const clickedMapId = e.target.getAttribute('data-id')
    console.log(clickedMapId)

    setPointStyle(clickedMapId)

    const clickedMap = mapData.find(
      //對照被點選的區id以及資料庫裡的區的id
      (item) => item.id === parseInt(clickedMapId)
    )

    // 更新選定的地圖
    setSelectedDis(clickedMap.id) //改變被選的區的id
    setSelectedDisName(clickedMap.name) //改變被選的區的名字
    setCurrentWeather({ ...currentWeather, StationID: clickedMap.station_id })
    console.log(clickedMap.station_id)
  }

  // 點擊潛點
  const handlePointButtonClick = (selectPoint) => {
    setSelectPointData(selectPoint) //改變潛點
  }
  // 圖片放大
  const handleCardImageClick = (imageSrc) => {
    setSelectedImage(imageSrc)
    setShowModal(true)
  }
  // 關閉圖片放大
  const closeModal = () => {
    setShowModal(false)
  }

  // 定義氣象會使用到的資料狀態
  const [currentWeather, setCurrentWeather] = useState({
    StationName: '',
    StationID: '',
    WaveHeight: '',
    SeaTemperature: '',
    WindSpeed: '',
    WindDirection: '',
    WindDirectionDescription: '',
    DateTime: '',
  })

  useEffect(() => {
    const handleWeatherClick = () => {
      fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=${AUTHORIZATION_KEY}&format=JSON&StationID=${currentWeather.StationID}&WeatherElement=&sort=StationID`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log('data', data)

          // 取得 SeaSurfaceObs 的資料
          const seaSurfaceObs = data?.Records?.SeaSurfaceObs

          if (seaSurfaceObs) {
            // 取得第一個位置的氣象觀測時間資料
            const observationTimes =
              seaSurfaceObs.Location[0]?.StationObsTimes?.StationObsTime

            if (observationTimes && observationTimes.length > 0) {
              // 取得第一個觀測時間點的氣象元素資料
              const weatherElements = observationTimes[0]?.WeatherElements

              if (weatherElements) {
                // 取得風速和波高資訊
                const windSpeed = weatherElements?.PrimaryAnemometer?.WindSpeed
                const WindDirectionDescription =
                  weatherElements?.PrimaryAnemometer?.WindDirectionDescription

                const waveHeight = weatherElements?.WaveHeight
                const SeaTemperature = weatherElements?.SeaTemperature

                // 解析並重新格式化日期
                const dateTimeString = observationTimes[0]?.DateTime
                const formattedDateTime = dateTimeString
                  .toString()
                  .replace(/T/, ' ')
                  .replace(/:00\+08:00/, '')

                setCurrentWeather((prevWeather) => ({
                  ...prevWeather,
                  DateTime: formattedDateTime,
                  WindSpeed: windSpeed,
                  WaveHeight: waveHeight,
                  SeaTemperature: SeaTemperature,
                  WindDirection: WindDirectionDescription,
                }))
              } else {
                console.error('找不到氣象元素資訊')
              }
            } else {
              console.error('找不到氣象觀測時間資訊')
            }
          } else {
            console.error('找不到 SeaSurfaceObs 資訊')
          }
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }

    if (currentWeather.StationID) {
      handleWeatherClick()
    }
  }, [currentWeather.StationID])

  return (
    <>
      <main className={styles['main']}>
        <ImageViewModal
          showModal={showModal}
          handleClose={closeModal}
          imageSrc={selectedImage}
          fullscreen={'md-up'}
        />
        {/* Modal↑ */}
        <Container className="my-5 p-3 border ">
          <Row>
            <Col xs={12} md={6} lg={6} className="border-end">
              <div className={styles['box']}>
                <TaiwanSvg
                  handleMapClick={handleMapClick}
                  pointStyle={pointStyle}
                />
              </div>
            </Col>
            <Col className={styles['weather']}>
              <div className={styles['111']}>
                <h2>{selectedDisName}</h2>

                <h4>{currentWeather.StationName}</h4>
                <div>
                  {/* 時間 */}觀測時間: {currentWeather.DateTime}
                </div>
                <Stack
                  direction="horizontal"
                  // gap={2}
                  className={styles['weather-detail']}
                >
                  <div>
                    {/* 風向 */} <span>風向</span>
                    <FaWind />
                    {currentWeather.WindDirection}
                  </div>
                  <div>
                    {/* 浪高 */} <span>浪高(m)</span>
                    <LuWaves />
                    {currentWeather.WaveHeight}
                  </div>
                  <div>
                    {/* 海溫 */}
                    <span>海溫(&#8451;)</span>
                    <TiWeatherCloudy />
                    {currentWeather.SeaTemperature}
                  </div>
                  <div>
                    {/* 風速 */}
                    <span>風速</span>
                    {currentWeather.WindSpeed}
                  </div>
                </Stack>
              </div>
              <div>
                <Container>
                  {disData.map((v) => {
                    const fileNames = v.image.split(',')
                    return (
                      <React.Fragment key={v.id}>
                        {fileNames.map((fileName, index) => (
                          <Image
                            thumbnail
                            fluid
                            key={index}
                            src={`/images/map/${fileName.trim()}`}
                            alt={v.image}
                            onClick={() =>
                              handleCardImageClick(
                                `/images/map/${fileName.trim()}`
                              )
                            }
                          />
                        ))}
                      </React.Fragment>
                    )
                  })}
                </Container>
              </div>
            </Col>
          </Row>
          <hr />
          <div className=" text-center">
            {selectedPointData &&
              selectedPointData.map((v) => (
                <DiButton
                  key={v.id}
                  text={v.name}
                  color={'#013c64'}
                  onClick={() => handlePointButtonClick(v.id)}
                />
              ))}
          </div>
          <Container>
            <Stack direction="horizontal" gap={3}>
              <div className="p-2">
                <div>
                  {' '}
                  {selectedPointData &&
                    selectedPointData
                      .filter((data) => data.id === selectPoint)
                      .map((v) => {
                        const fileNames = v.image.split(',')
                        return (
                          <React.Fragment key={v.id}>
                            {fileNames.map((fileName, index) => (
                              <Image
                                fluid
                                key={index}
                                src={`/images/map/${fileName.trim()}`}
                                alt={v.image}
                                onClick={() =>
                                  handleCardImageClick(
                                    `/images/map/${fileName.trim()}`
                                  )
                                }
                              />
                            ))}
                          </React.Fragment>
                        )
                      })}
                </div>
              </div>
            </Stack>
          </Container>
        </Container>
      </main>
    </>
  )
}
