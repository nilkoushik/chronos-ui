Feature: Banner
  As a consumer of @contentvidya/ui
  I want the Banner web component to render correctly across its options
  So that hero sections, media, hotspots, and background effects work in production

  Scenario: Renders title, subtitle and CTA
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title    | Summer Collection 2026        |
      | subtitle | Discover the new season       |
      | cta-text | Shop Now                      |
      | cta-link | /shop                         |
    Then it should render without any page errors
    And the component text should include "Summer Collection 2026"
    And the component text should include "Discover the new season"
    And the component text should include "Shop Now"
    And the component should have no serious accessibility violations

  Scenario: Renders an image background
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title | Image Banner                                        |
      | media | {"type":"image","url":"/assets/img/placeholder-01.svg"} |
    Then it should render without any page errors
    And the component should contain a visible "img, [style*='background-image']" element

  Scenario: Renders a video background
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title | Video Banner                                  |
      | media | {"type":"video","url":"/assets/video/demo.mp4"} |
    Then it should render without any page errors
    And the component should contain a visible "video" element

  Scenario Outline: Renders rect/oval/polygon hotspots
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title    | Hotspot Banner |
      | hotspots | [{"id":"h1","altText":"Item","shape":"<shape>","coords":{"x":10,"y":10,"width":20,"height":20},"points":<points>,"action":{"type":"link","url":"/item"},"pulse":true,"showTooltip":true}] |
    Then it should render without any page errors
    And it should contain 1 elements matching "a.contentvidya-hotspot"

    Examples:
      | shape   | points                                                          |
      | rect    | []                                                               |
      | oval    | []                                                               |
      | polygon | [{"x":10,"y":10},{"x":30,"y":10},{"x":20,"y":30}]                |

  Scenario Outline: Renders every background effect without error and animates
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title  | Effect Banner                        |
      | config | {"backgroundEffect":"<effect>"}      |
    Then it should render without any page errors
    And the canvas should be actively animating

    Examples:
      | effect       |
      | particles    |
      | waves        |
      | rain         |
      | thunderstorm |
      | sunrise      |
      | sunset       |
      | fog          |
      | autumn       |
      | festival     |
      | santa        |
      | sea          |

  Scenario: backgroundEffect "none" renders no canvas
    Given I mount the "contentvidya-banner" component as "Banner" with:
      | title  | No Effect Banner            |
      | config | {"backgroundEffect":"none"} |
    Then it should render without any page errors
    And the component should not contain a "canvas" element
