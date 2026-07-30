Feature: Svelte target
  As a consumer of @contentvidya/ui
  I want every component's compiled Svelte output to render correctly
  So that Svelte apps get the same behavior as the React and Web Component targets

  Scenario: Banner renders content and animates its background effect
    Given I mount the "Banner" Svelte component with:
      | title  | Summer Collection 2026            |
      | config | {"backgroundEffect":"particles"}  |
    Then it should render without any page errors
    And the component text should include "Summer Collection 2026"
    And the canvas should be actively animating
    And the component should have no serious accessibility violations

  Scenario: AnnouncementBar renders a linked message
    Given I mount the "AnnouncementBar" Svelte component with:
      | message  | Free shipping on orders over $75 |
      | mapLinks | [{"url":"/sale"}]                 |
    Then it should render without any page errors
    And it should contain 1 elements matching "a[href='/sale']"
    And the component should have no serious accessibility violations

  Scenario: GridBanner renders every item as a card
    Given I mount the "GridBanner" Svelte component with:
      | columns | 3                                                                                                                                                                                                              |
      | items   | [{"id":"1","title":"Women's","media":{"type":"image","url":"/assets/img/placeholder-02.svg"}},{"id":"2","title":"Men's","media":{"type":"image","url":"/assets/img/placeholder-03.svg"}}] |
    Then it should render without any page errors
    And it should contain 2 elements matching "a"
    And the component should have no serious accessibility violations

  Scenario: MediaGrid renders primary and secondary media
    Given I mount the "MediaGrid" Svelte component with:
      | primaryMedia   | {"id":"p1","title":"Premium Sound","media":{"type":"image","url":"/assets/img/placeholder-05.svg"}} |
      | secondaryMedia | [{"id":"s1","title":"Wireless Comfort","media":{"type":"image","url":"/assets/img/placeholder-06.svg"}}] |
    Then it should render without any page errors
    And it should contain an element matching ".contentvidya-media-primary img" with alt text "Premium Sound"
    And the component should have no serious accessibility violations

  Scenario: RowScrollable renders its title and items
    Given I mount the "RowScrollable" Svelte component with:
      | title | Trending Items                                                                                          |
      | items | [{"id":"1","title":"Smart Watch v2","price":"$299","media":{"type":"image","url":"/assets/img/placeholder-08.svg"}}] |
    Then it should render without any page errors
    And the component text should include "Trending Items"
    And the component should have no serious accessibility violations

  Scenario: SlidingBanner renders slides and animates its background effect
    Given I mount the "SlidingBanner" Svelte component with:
      | items  | [{"id":"1","title":"Slide 1"},{"id":"2","title":"Slide 2"}]         |
      | config | {"backgroundEffect":"waves","autoStart":false,"showDots":true} |
    Then it should render without any page errors
    And it should contain 2 elements matching "button.contentvidya-sliding-dot"
    And the canvas should be actively animating
    And the component should have no serious accessibility violations

  Scenario: AlternatingSlider renders the configured columns
    Given I mount the "AlternatingSlider" Svelte component with:
      | items  | [{"id":"1","title":"Ocean Breeze"},{"id":"2","title":"Forest Trail"}] |
      | config | {"columns":2,"autoStart":false}                                        |
    Then it should render without any page errors
    And it should contain 2 elements matching ".contentvidya-alt-col"
    And the component should have no serious accessibility violations

  Scenario: TimerWidget renders a countdown and animates its background effect
    Given I mount the "TimerWidget" Svelte component with:
      | title            | Sale Ends In          |
      | targetDate       | 2099-12-31T23:59:59Z  |
      | backgroundEffect | rain                  |
    Then it should render without any page errors
    And it should contain 4 elements matching ".contentvidya-timer-block"
    And the canvas should be actively animating
    And the component should have no serious accessibility violations

  Scenario: WysiwygRenderer renders semantic HTML
    Given I mount the "WysiwygRenderer" Svelte component with:
      | htmlContent | <h2>Premium Editorial Layout</h2><p>Body copy</p> |
    Then it should render without any page errors
    And the component text should include "Premium Editorial Layout"
    And the component should have no serious accessibility violations

  Scenario: RichTextEditor renders its toolbar and initial content
    Given I mount the "RichTextEditor" Svelte component with:
      | initialContent | <p>Hello editor</p>                           |
      | config         | {"toolbar":["bold","image","video"]}          |
    Then it should render without any page errors
    And the component text should include "Hello editor"
    And the component should contain a visible "button[title='Bold']" element
    And the component should have no serious accessibility violations
