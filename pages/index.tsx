import React from 'react'

import Head from 'next/head'

import axios from 'axios'
import { motion } from 'framer-motion'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { acts, length } from '../data/acts.json'

type Props = {
  page: number,
  progress: ReturnType<typeof progress>
}

export default function Home(props: Props) {
  return <motion.div initial="hidden" animate="visible" variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: .6
      }
    },
  }} style={{
    borderRadius: 4,
    width: '40em',
    border: '3px solid #cccccc',
    margin: '48px auto 48px auto',
    padding: '4em',
    userSelect: 'none'
  }}>
    <Head>
      <title>Arct's HS</title>

      <meta name="title" content="Arct's Homestuck Progress" />
      <meta name="description" content={`I'm reading Homestuck! Currently on page ${props.page}.`} />

      <meta property="og:title" content="Arct's Homestuck Progress" />
      <meta property="og:description" content={`I'm reading Homestuck! Currently on page ${props.page}.`} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://hs.arct.io/" />
      <meta property="og:image" content="https://hs.arct.io/favicon.png" />
    </Head>

    <h1>I'm Reading <a href="https://homestuck.com/">Homestuck</a></h1>

    <h4>Current Page: <a href={`https://homestuck.com/story/${props.page}`} target="_blank">{props.page}</a><sup><a href="https://gist.github.com/arktfox/717713ca16ae584e70668b379c6ae089/edit" target="_blank" style={{ fontSize: 12 }}>🔧</a></sup></h4>

    <h3 style={{ marginTop: '1em' }}>Progress</h3>
    {props.progress.map((act, i) =><div key={i}>
        <div className="row" style={{ width: '32em' }}>
          <div className="col">
            <span>{act.name}</span>
          </div>
          <div className="col">
            <div style={{ paddingBottom: '10px', width: '16em' }}>
              <ProgressBar variant={act.progress >= 100 ? "success" : "info"} animated={act.progress < 100} now={act.progress} label={`${act.progress.toFixed(1)}%`} />
            </div>
          </div>
        </div>

        {act.sub.map((act, i) =>
          <div className="row" style={{ width: '32em' }} key={i}>
            <div className="col">
              <span style={{ marginLeft: '2em' }}>{act.name}</span>
            </div>
            <div className="col">
              <div style={{ paddingBottom: '10px', width: '16em' }}>
                <ProgressBar variant={act.progress >= 100 ? "success" : "info"} animated={act.progress < 100} now={act.progress} label={`${act.progress.toFixed(1)}%`} />
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    <h3 style={{ marginTop: '1em' }}>Overall Progress: {`${(100 * props.page / length).toFixed(1)}%`}</h3>
    <div style={{ paddingBottom: '10px', width: '32em' }}>
      <ProgressBar style={{ height: '20px' }}>
        {props.progress.map((act, i) =>
          <ProgressBar variant={act.progress >= 100 ? "success" : "info"} animated={act.progress < 100} now={act.progress * act.length / length} label={act.progress >= 100 ? `${act.short}` : `${act.progress.toFixed(1)}%`} key={i} />
        )}
      </ProgressBar>
    </div>
  </motion.div>
}

export async function getServerSideProps(ctx: any) {
  const { data } = await axios.get('https://gist.githubusercontent.com/arktfox/717713ca16ae584e70668b379c6ae089/raw/hs.json')
  const { page } = data

  return {
    props: {
      page,
      progress: progress(page)
    }
  }
}

const percent = (n: number) =>
  Math.max(Math.min(100 * n, 100), 0)

const short = (s: string) =>
  s.match(/\b[a-zA-Z0-9]/g)?.join('') || ''

function progress(page: number) {
  let acc = 0
  return acts.map(act => {
    const pages = Math.max(page - acc, 0)

    let subacc = acc
    const sub = act?.sub?.map(sub => {
      const pages = Math.max(page - subacc, 0)

      subacc += sub.length

      return {
        ...sub,

        short: short(sub.name),
        progress: percent(pages / sub.length)
      }
    }) || []

    acc += act.length

    return {
      ...act,

      short: short(act.name),
      progress: percent(pages / act.length),
      sub
    }
  })
}