<script lang="ts">
  import '@contentvidya/ui/theme.css';
  import '@contentvidya/ui/styles/components/Banner.css';
  import '@contentvidya/ui/styles/components/AnnouncementBar.css';
  import '@contentvidya/ui/styles/components/GridBanner.css';
  import '@contentvidya/ui/styles/components/MediaGrid.css';
  import '@contentvidya/ui/styles/components/RowScrollable.css';
  import '@contentvidya/ui/styles/components/TimerWidget.css';
  import '@contentvidya/ui/styles/components/WysiwygRenderer.css';
  import '@contentvidya/ui/styles/components/RichTextEditor.css';
  import '@contentvidya/ui/styles/components/SlidingBanner.css';
  import '@contentvidya/ui/styles/components/AlternatingSlider.css';
  
  import Banner from '@contentvidya/ui/svelte/Banner.svelte';
  import AnnouncementBar from '@contentvidya/ui/svelte/AnnouncementBar.svelte';
  import GridBanner from '@contentvidya/ui/svelte/GridBanner.svelte';
  import MediaGrid from '@contentvidya/ui/svelte/MediaGrid.svelte';
  import RowScrollable from '@contentvidya/ui/svelte/RowScrollable.svelte';
  import SlidingBanner from '@contentvidya/ui/svelte/SlidingBanner.svelte';
  import AlternatingSlider from '@contentvidya/ui/svelte/AlternatingSlider.svelte';
  import TimerWidget from '@contentvidya/ui/svelte/TimerWidget.svelte';
  import WysiwygRenderer from '@contentvidya/ui/svelte/WysiwygRenderer.svelte';
  import RichTextEditor from '@contentvidya/ui/svelte/RichTextEditor.svelte';
  
  let rteContent = "<p>Hello World from Rich Text Editor</p>";
</script>

<main class="demo-container">
  <h1>ContentVidya UI Svelte Examples</h1>

  <section>
    <h2>Announcement Bar</h2>
    <AnnouncementBar message="Special Offer! Use code SVELTE20" mapLinks={[{url: "#"}]} backgroundColor="#8b5cf6" textColor="#ffffff" />
  </section>

  <section>
    <h2>Timer Widget</h2>
    <TimerWidget title="Ends in:" targetDate="2027-12-31T23:59:59Z" variant="dark" expiredText="This offer has ended." />
  </section>

  <section>
    <h2>Timer Widget (background image, height set explicitly)</h2>
    <!-- width defaults to "auto"; height is set to a fixed value here the way a CMS
         would after computing it from the image's natural aspect ratio, so the space
         is reserved up front and the page doesn't reflow once the image loads. -->
    <TimerWidget
      title="Flash Sale Ends In"
      targetDate="2027-12-31T23:59:59Z"
      variant="neon"
      backgroundImageUrl="/img/placeholder-05.svg"
      overlay="rgba(0, 0, 0, 0.5)"
      width="auto"
      height="320px"
      expiredText="This offer has ended."
    />
  </section>

  <section>
    <h2>Banner</h2>
    <Banner
      title="Welcome Banner"
      subtitle="This is a simple banner component"
      media={{ type: 'image', url: '/img/placeholder-01.svg' }}
      hotspots={[
        { id: 'h1', altText: 'Featured item', label: 'Featured', shape: 'rect', coords: { x: 8, y: 18, width: 16, height: 28 }, action: { type: 'link', url: '#explore' }, pulse: true, showTooltip: true },
        { id: 'h2', altText: 'Sunglasses', label: 'Sunglasses', shape: 'oval', coords: { x: 34, y: 12, width: 10, height: 8 }, action: { type: 'link', url: '#explore' }, pulse: true, showTooltip: true },
        { id: 'h3', altText: 'Sneakers', label: 'Sneakers', shape: 'polygon', coords: { x: 55, y: 60, width: 20, height: 15 }, points: [{ x: 55, y: 68 }, { x: 62, y: 60 }, { x: 75, y: 62 }, { x: 70, y: 75 }], action: { type: 'link', url: '#explore' }, pulse: true, showTooltip: true }
      ]}
      lazyLoad={true}
      ctaText="Explore Now"
      ctaLink="#explore"
      config={{
        align: 'center',
        padding: 'lg',
        bgGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))',
        hotspotMinTargetSize: 24
      }}
    />
  </section>
  
  <section>
    <h2>Banner — Background Effects</h2>
    <p>Animated canvas layer rendered behind the media/overlay, from the shared background-effects plugin engine (<code>src/utils/backgroundEffects.ts</code>) — also used by SlidingBanner. New effects can be registered there once and become available everywhere the engine is used.</p>

    <h3>Particles</h3>
    <Banner title="Particles" media={{ type: 'image', url: '/img/placeholder-06.svg' }} config={{ height: '260px', backgroundEffect: 'particles' }} />

    <h3>Waves</h3>
    <Banner title="Waves" media={{ type: 'image', url: '/img/placeholder-07.svg' }} config={{ height: '260px', backgroundEffect: 'waves' }} />

    <h3>Rain</h3>
    <Banner title="Rain" media={{ type: 'image', url: '/img/placeholder-08.svg' }} config={{ height: '260px', backgroundEffect: 'rain' }} />

    <h3>Thunderstorm</h3>
    <Banner title="Thunderstorm" media={{ type: 'image', url: '/img/placeholder-09.svg' }} config={{ height: '260px', backgroundEffect: 'thunderstorm' }} />

    <h3>Sunrise</h3>
    <Banner title="Sunrise" media={{ type: 'image', url: '/img/placeholder-10.svg' }} config={{ height: '260px', backgroundEffect: 'sunrise' }} />

    <h3>Sunset</h3>
    <Banner title="Sunset" media={{ type: 'image', url: '/img/placeholder-11.svg' }} config={{ height: '260px', backgroundEffect: 'sunset' }} />

    <h3>Winter Fog (wind + frost shards)</h3>
    <Banner title="Winter Fog" media={{ type: 'image', url: '/img/placeholder-12.svg' }} config={{ height: '260px', backgroundEffect: 'fog' }} />

    <h3>Autumn Leaves</h3>
    <Banner title="Autumn" media={{ type: 'image', url: '/img/placeholder-13.svg' }} config={{ height: '260px', backgroundEffect: 'autumn' }} />

    <h3>Indian Festival (Diwali)</h3>
    <Banner title="Festival" media={{ type: 'image', url: '/img/placeholder-14.svg' }} config={{ height: '260px', backgroundEffect: 'festival' }} />

    <h3>Santa Sleigh</h3>
    <Banner title="Santa" media={{ type: 'image', url: '/img/placeholder-01.svg' }} config={{ height: '260px', backgroundEffect: 'santa' }} />

    <h3>Sea Waves (aerial seashore)</h3>
    <Banner title="Sea" media={{ type: 'image', url: '/img/placeholder-02.svg' }} config={{ height: '260px', backgroundEffect: 'sea' }} />
  </section>

  <section>
    <h2>Grid Banner</h2>
    <GridBanner 
      columns={4}
      items={[
        { id: '1', title: 'Grid 1', media: { type: 'image', url: '/img/placeholder-06.svg' } },
        { id: '2', title: 'Grid 2', media: { type: 'image', url: '/img/placeholder-06.svg' } },
        { id: '3', title: 'Grid 3', media: { type: 'image', url: '/img/placeholder-06.svg' } },
        { id: '4', title: 'Grid 4', media: { type: 'image', url: '/img/placeholder-06.svg' } }
      ]}
    />
  </section>
  
  <section>
    <h2>Media Grid</h2>
    <MediaGrid 
      primaryMedia={{ id: 'p1', media: { type: 'image', url: '/img/placeholder-07.svg' } }}
      secondaryMedia={[
        { id: 's1', media: { type: 'image', url: '/img/placeholder-08.svg' } },
        { id: 's2', media: { type: 'image', url: '/img/placeholder-08.svg' } }
      ]}
    />
  </section>
  
  <section>
    <h2>Row Scrollable</h2>
    <RowScrollable 
      title="Scrollable Row" 
      items={[
        { id: '1', title: 'Item 1', media: { type: 'image', url: '/img/placeholder-09.svg' } },
        { id: '2', title: 'Item 2', media: { type: 'image', url: '/img/placeholder-09.svg' } },
        { id: '3', title: 'Item 3', media: { type: 'image', url: '/img/placeholder-09.svg' } },
        { id: '4', title: 'Item 4', media: { type: 'image', url: '/img/placeholder-09.svg' } },
        { id: '5', title: 'Item 5', media: { type: 'image', url: '/img/placeholder-09.svg' } }
      ]}
    />
  </section>
  
  <section>
    <h2>Sliding Banner</h2>
    <SlidingBanner 
      config={{ autoStart: true, showDots: true, animationEffect: 'fade' }}
      items={[
        { id: '1', title: 'Slide 1', subtitle: 'First slide description', media: { type: 'image', url: '/img/placeholder-10.svg' } },
        { id: '2', title: 'Slide 2', subtitle: 'Second slide description', media: { type: 'image', url: '/img/placeholder-10.svg' } }
      ]}
    />
  </section>
  
  <section>
    <h2>Alternating Slider</h2>
    <AlternatingSlider 
      items={[
        { id: '1', title: 'Category 1', subtitle: 'Explore', media: { type: 'image', url: '/img/placeholder-02.svg' } },
        { id: '2', title: 'Category 2', subtitle: 'Discover', media: { type: 'image', url: '/img/placeholder-03.svg' } },
        { id: '3', title: 'Category 3', subtitle: 'Shop', media: { type: 'image', url: '/img/placeholder-04.svg' } },
        { id: '4', title: 'Category 4', subtitle: 'Trends', media: { type: 'image', url: '/img/placeholder-05.svg' } }
      ]}
      config={{ columns: 2, autoStart: true, delayMs: 4000, showDots: true, showArrows: true }}
    />
  </section>

  <section>
    <h2>Rich Text Editor</h2>
    <div style="border: 1px solid #334155; border-radius: 8px; overflow: hidden;">
      <RichTextEditor 
        content={rteContent} 
        onChange={(html) => rteContent = html}
      />
    </div>
    
    <h3 style="margin-top: 1rem;">WYSIWYG Renderer (Output)</h3>
    <div style="padding: 1rem; background: #0f172a; border-radius: 8px;">
      <WysiwygRenderer content={rteContent} />
    </div>
  </section>
</main>

<style>
  .demo-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
    color: #f1f5f9;
    background: #020617;
  }
  h1 {
    text-align: center;
    color: #a78bfa;
    margin-bottom: 3rem;
  }
  section {
    margin-bottom: 4rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  h2 {
    color: #38bdf8;
    margin-bottom: 1.5rem;
  }
  :global(body) {
    margin: 0;
    background: #020617;
  }
</style>
