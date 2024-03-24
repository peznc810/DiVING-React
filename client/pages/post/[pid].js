// 動態路由的意思 網址後面那一段會轉化為pid這個變數
// 怎麼看到這一頁? 在這個資料夾裡面 不是list頁都算是詳細頁 (酷!)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import TagButton from '@/components/post/tagButton'
import { Container, Card, Col, Row } from 'react-bootstrap'
import DOMPurify from 'dompurify'
import LoaderPing from '@/components/post/loaderPing'
import postStyle from '@/components/post/post-pid.module.scss'

export default function Detail() {
  const router = useRouter()

  const [post, setPost] = useState({
    id: '',
    author: '',
    published: '',
    image: '',
    title: '',
    content: '',
    tags: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const getPost = async (pid) => {
    try {
      // 網址改成pid 用傳入的
      const res = await fetch(`http://localhost:3005/api/post/${pid}`)
      const data = await res.json()

      if (data.title) {
        setPost(data)

        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    // 出現值再跟伺服器要資料
    console.log(router.query)

    if (router.isReady) {
      // 如果isReady是true 確保能得到 query的值
      const { pid } = router.query
      console.log(pid)

      getPost(pid)
    }
  }, [router.isReady])

  const loader = <LoaderPing />
  const getTagsArray = (tagsString) => {
    // 檢查 tagsString 是否存在
    if (tagsString) {
      return tagsString.split(',')
    }
    return []
  }
  const display = (
    <>
      <Container>
        <Row>
          <Col md={8} className="bg-light p-4 mb-3">
            <p>{post.published}</p>
            <h3>{post.title}</h3>
            作者：{post.name}
            <div className="my-2">
              {' '}
              {getTagsArray(post.tags).map((tag, index) => (
                <Link key={index} href={`/post/tagPost/${tag}`} target="_blank">
                  <TagButton text={`# ${tag}`} />
                </Link>
              ))}
            </div>
            <Card.Img
              variant="top"
              // src={`/images/post/${post.image}`}
              src={`http://localhost:3005/upload/${post.image}`}
            />
            <div
              className="m-4"
              // dangerouslySetInnerHTML={{
              //   __html: DOMPurify.sanitize(post.content),
              // }}
              dangerouslySetInnerHTML={{
                __html: post.content,
              }}
            ></div>
          </Col>
        </Row>
      </Container>
    </>
  )
  return (
    <>
      <div className={postStyle['main']}>
        <div className={postStyle['right']}>
          <div className={postStyle['ocean']}>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--1']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--2']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--3']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--4']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--5']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--6']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--7']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--8']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--9']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--10']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--11']}`}
            ></div>
            <div
              className={`${postStyle['bubble']} ${postStyle['bubble--12']}`}
            ></div>
            <div id={postStyle['octocat']}></div>
          </div>
        </div>

        <div className="p-3">
          <Link href="/post">回列表頁</Link>
        </div>
        {isLoading ? loader : display}
      </div>
    </>
  )
}
