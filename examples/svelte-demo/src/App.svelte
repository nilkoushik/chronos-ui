<script lang="ts">
  import '@chronos-ui/core/theme.css';
  import '@chronos-ui/core/styles/components/Banner.css';
  import '@chronos-ui/core/styles/components/AnnouncementBar.css';
  import '@chronos-ui/core/styles/components/GridBanner.css';
  import '@chronos-ui/core/styles/components/MediaGrid.css';
  import '@chronos-ui/core/styles/components/RowScrollable.css';
  import '@chronos-ui/core/styles/components/TimerWidget.css';
  import '@chronos-ui/core/styles/components/WysiwygRenderer.css';
  import '@chronos-ui/core/styles/components/RichTextEditor.css';
  import '@chronos-ui/core/styles/components/SlidingBanner.css';
  import '@chronos-ui/core/styles/components/AlternatingSlider.css';
  
  import Banner from '@chronos-ui/core/svelte/Banner.svelte';
  import AnnouncementBar from '@chronos-ui/core/svelte/AnnouncementBar.svelte';
  import GridBanner from '@chronos-ui/core/svelte/GridBanner.svelte';
  import MediaGrid from '@chronos-ui/core/svelte/MediaGrid.svelte';
  import RowScrollable from '@chronos-ui/core/svelte/RowScrollable.svelte';
  import SlidingBanner from '@chronos-ui/core/svelte/SlidingBanner.svelte';
  import AlternatingSlider from '@chronos-ui/core/svelte/AlternatingSlider.svelte';
  import TimerWidget from '@chronos-ui/core/svelte/TimerWidget.svelte';
  import WysiwygRenderer from '@chronos-ui/core/svelte/WysiwygRenderer.svelte';
  import RichTextEditor from '@chronos-ui/core/svelte/RichTextEditor.svelte';
  
  let rteContent = "<p>Hello World from Rich Text Editor</p>";
</script>

<main class="demo-container">
  <h1>Chronos UI Svelte Examples</h1>

  <section>
    <h2>Announcement Bar</h2>
    <AnnouncementBar message="Special Offer! Use code SVELTE20" mapLinks={[{url: "#"}]} backgroundColor="#8b5cf6" textColor="#ffffff" />
  </section>

  <section>
    <h2>Timer Widget</h2>
    <TimerWidget title="Ends in:" targetDate="2027-12-31T23:59:59Z" />
  </section>

  <section>
    <h2>Banner</h2>
    <Banner
      title="Welcome Banner"
      subtitle="This is a simple banner component"
      media={{ type: 'image', url: '/img/placeholder-01.svg' }}
      hotspots={[
        { id: 'h1', altText: 'Featured item', label: 'Featured', shape: 'rect', coords: { x: 10, y: 20, width: 18, height: 30 }, action: { type: 'link', url: '#explore' }, pulse: true, showTooltip: true }
      ]}
      lazyLoad={true}
      ctaText="Explore Now"
      ctaLink="#explore"
      config={{
        align: 'center',
        padding: 'lg',
        bgGradient: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))'
      }}
    />
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
