import { useState } from 'react'
import '@chronos-ui/core/theme.css'
import '@chronos-ui/core/styles/components/Banner.css'
import '@chronos-ui/core/styles/components/AnnouncementBar.css'
import '@chronos-ui/core/styles/components/GridBanner.css'
import '@chronos-ui/core/styles/components/MediaGrid.css'
import '@chronos-ui/core/styles/components/RowScrollable.css'
import '@chronos-ui/core/styles/components/TimerWidget.css'
import '@chronos-ui/core/styles/components/WysiwygRenderer.css'
import '@chronos-ui/core/styles/components/RichTextEditor.css'
import '@chronos-ui/core/styles/components/SlidingBanner.css'
import '@chronos-ui/core/styles/components/AlternatingSlider.css'

import Banner from '@chronos-ui/core/react/Banner'
import AnnouncementBar from '@chronos-ui/core/react/AnnouncementBar'
import GridBanner from '@chronos-ui/core/react/GridBanner'
import MediaGrid from '@chronos-ui/core/react/MediaGrid'
import RowScrollable from '@chronos-ui/core/react/RowScrollable'
import TimerWidget from '@chronos-ui/core/react/TimerWidget'
import WysiwygRenderer from '@chronos-ui/core/react/WysiwygRenderer'
import RichTextEditor from '@chronos-ui/core/react/RichTextEditor'
import SlidingBanner from '@chronos-ui/core/react/SlidingBanner'
import AlternatingSlider from '@chronos-ui/core/react/AlternatingSlider'

function App() {
  const mapLinks = [
    { label: "Women's Collection", url: "#women" },
    { label: "Men's Collection", url: "#men" },
    { label: "Accessories", url: "#accessories" },
    { label: "Sale", url: "#sale" }
  ];

  return (
    <div className="demo-container">
      <h1>Chronos UI - React Demo</h1>
      
      <div className="demo-section">
        <h2>Announcement Bar</h2>
        <AnnouncementBar message="🚀 Huge Summer Sale - Up to 50% Off Everything!" mapLinks={[{url: '/sale'}]} />
      </div>

      <div className="demo-section">
        <h2>Banner</h2>
        <Banner 
          title="Summer Collection 2026" 
          subtitle="Discover the latest trends for the season" 
          ctaText="Shop Now" 
          media={{ type: 'image', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80' }}
        />
      </div>

      <div className="demo-section">
        <h2>Rich Text Editor</h2>
        <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
          <RichTextEditor initialContent="<p>Hello World from <strong>React</strong>!</p>" />
        </div>
      </div>

      <div className="demo-section">
        <h2>Sliding Banner</h2>
        <SlidingBanner 
          items={[
            { id: '1', title: 'Summer Collection', subtitle: 'Light and breezy', media: { type: 'image', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80' } },
            { id: '2', title: 'Winter Essentials', subtitle: 'Stay warm', media: { type: 'image', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80' } }
          ]} 
          config={{ autoStart: true, delayMs: 3000, showDots: true, showArrows: true, rotateAgain: true, animationEffect: 'slide' }}
        />
      </div>

      <div className="demo-section">
        <h2>Alternating Slider</h2>
        <AlternatingSlider 
          items={[
            { id: '1', title: 'Category 1', subtitle: 'Explore', media: { type: 'image', url: 'https://images.unsplash.com/photo-1434389678369-183428d00c4c?auto=format&fit=crop&w=800&q=80' } },
            { id: '2', title: 'Category 2', subtitle: 'Discover', media: { type: 'image', url: 'https://images.unsplash.com/photo-1558769132-cb1fac084092?auto=format&fit=crop&w=800&q=80' } },
            { id: '3', title: 'Category 3', subtitle: 'Shop', media: { type: 'image', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80' } },
            { id: '4', title: 'Category 4', subtitle: 'Trends', media: { type: 'image', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80' } }
          ]} 
          config={{ columns: 2, autoStart: true, delayMs: 4000, showDots: true, showArrows: true }}
        />
      </div>

      <div className="demo-section">
        <h2>Timer Widget</h2>
        <TimerWidget targetDate="2026-12-31T23:59:59" title="Flash Sale Ends In:" />
      </div>

    </div>
  )
}

export default App
