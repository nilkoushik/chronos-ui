Feature: React target
  As a consumer of @chronos-ui/core
  I want every component's compiled React output to render correctly
  So that React apps get the same behavior as the Svelte and Web Component targets

  Scenario: Banner renders content and animates its background effect
    Given I mount the "Banner" React component with:
      | title  | Summer Collection 2026            |
      | config | {"backgroundEffect":"particles"}  |
    Then it should render without any page errors
    And the component text should include "Summer Collection 2026"
    And the canvas should be actively animating
    And the component should have no serious accessibility violations

  Scenario: AnnouncementBar renders a linked message
    Given I mount the "AnnouncementBar" React component with:
      | message  | Free shipping on orders over $75 |
      | mapLinks | [{"url":"/sale"}]                 |
    Then it should render without any page errors
    And it should contain 1 elements matching "a[href='/sale']"

  Scenario: GridBanner renders every item as a card
    Given I mount the "GridBanner" React component with:
      | columns | 3                                                                                                                                                                                                              |
      | items   | [{"id":"1","title":"Women's","media":{"type":"image","url":"/assets/img/placeholder-02.svg"}},{"id":"2","title":"Men's","media":{"type":"image","url":"/assets/img/placeholder-03.svg"}}] |
    Then it should render without any page errors
    And it should contain 2 elements matching "a"

  Scenario: MediaGrid renders primary and secondary media
    Given I mount the "MediaGrid" React component with:
      | primaryMedia   | {"id":"p1","title":"Premium Sound","media":{"type":"image","url":"/assets/img/placeholder-05.svg"}} |
      | secondaryMedia | [{"id":"s1","title":"Wireless Comfort","media":{"type":"image","url":"/assets/img/placeholder-06.svg"}}] |
    Then it should render without any page errors
    And it should contain an element matching ".chronos-media-primary img" with alt text "Premium Sound"

  Scenario: RowScrollable renders its title and items
    Given I mount the "RowScrollable" React component with:
      | title | Trending Items                                                                                          |
      | items | [{"id":"1","title":"Smart Watch v2","price":"$299","media":{"type":"image","url":"/assets/img/placeholder-08.svg"}}] |
    Then it should render without any page errors
    And the component text should include "Trending Items"

  Scenario: SlidingBanner renders slides and animates its background effect
    Given I mount the "SlidingBanner" React component with:
      | items  | [{"id":"1","title":"Slide 1"},{"id":"2","title":"Slide 2"}]         |
      | config | {"backgroundEffect":"waves","autoStart":false,"showDots":true} |
    Then it should render without any page errors
    And it should contain 2 elements matching "button.chronos-sliding-dot"
    And the canvas should be actively animating

  Scenario: AlternatingSlider renders the configured columns
    Given I mount the "AlternatingSlider" React component with:
      | items  | [{"id":"1","title":"Ocean Breeze"},{"id":"2","title":"Forest Trail"}] |
      | config | {"columns":2,"autoStart":false}                                        |
    Then it should render without any page errors
    And it should contain 2 elements matching ".chronos-alt-col"

  Scenario: TimerWidget renders a countdown and animates its background effect
    Given I mount the "TimerWidget" React component with:
      | title            | Sale Ends In          |
      | targetDate       | 2099-12-31T23:59:59Z  |
      | backgroundEffect | rain                  |
    Then it should render without any page errors
    And it should contain 4 elements matching ".chronos-timer-block"
    And the canvas should be actively animating

  Scenario: WysiwygRenderer renders semantic HTML
    Given I mount the "WysiwygRenderer" React component with:
      | htmlContent | <h2>Premium Editorial Layout</h2><p>Body copy</p> |
    Then it should render without any page errors
    And the component text should include "Premium Editorial Layout"

  Scenario: RichTextEditor renders its toolbar and initial content
    Given I mount the "RichTextEditor" React component with:
      | initialContent | <p>Hello editor</p>                           |
      | config         | {"toolbar":["bold","image","video"]}          |
    Then it should render without any page errors
    And the component text should include "Hello editor"
    And the component should contain a visible "button[title='Bold']" element
