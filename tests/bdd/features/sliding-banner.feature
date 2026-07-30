Feature: SlidingBanner
  As a consumer of @contentvidya/ui
  I want the SlidingBanner web component to render slides, transitions, and background effects
  So that hero sliders work reliably across every configuration

  Scenario: Renders slides with dots and arrows
    Given I mount the "sliding-banner" component as "SlidingBanner" with:
      | items  | [{"id":"1","title":"Slide 1"},{"id":"2","title":"Slide 2"},{"id":"3","title":"Slide 3"}] |
      | config | {"showDots":true,"showNextPrev":true} |
    Then it should render without any page errors
    And it should contain 3 elements matching "button.contentvidya-sliding-dot"
    And it should contain 1 elements matching "button.contentvidya-sliding-arrow.prev"
    And it should contain 1 elements matching "button.contentvidya-sliding-arrow.next"
    And the component should have no serious accessibility violations

  Scenario Outline: Renders every transition effect without error
    Given I mount the "sliding-banner" component as "SlidingBanner" with:
      | items  | [{"id":"1","title":"Slide 1"},{"id":"2","title":"Slide 2"}] |
      | config | {"animationEffect":"<effect>","autoStart":false} |
    Then it should render without any page errors

    Examples:
      | effect           |
      | slide             |
      | fade              |
      | zoom              |
      | flip              |
      | push-horizontal    |
      | push-vertical      |
      | wipe               |
      | cube               |
      | door               |
      | fall               |
      | crush              |
      | peel-off           |
      | curtain            |

  Scenario Outline: Renders every background effect and animates
    Given I mount the "sliding-banner" component as "SlidingBanner" with:
      | items  | [{"id":"1","title":"Slide 1"},{"id":"2","title":"Slide 2"}] |
      | config | {"backgroundEffect":"<effect>","autoStart":false} |
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

  Scenario: Autoplay advances to the next slide
    Given I mount the "sliding-banner" component as "SlidingBanner" with:
      | items  | [{"id":"1","title":"First Slide"},{"id":"2","title":"Second Slide"}] |
      | config | {"autoStart":true,"delayMs":1000,"rotateAgain":true} |
    Then it should render without any page errors
    And the component text should include "First Slide"
    When I wait 1500 ms
    Then the component text should include "Second Slide"
