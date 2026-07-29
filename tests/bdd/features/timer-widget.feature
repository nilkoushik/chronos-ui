Feature: TimerWidget
  As a consumer of @contentvidya/ui
  I want the TimerWidget web component to render a countdown across its variants and effects
  So that promotional countdowns display correctly in production

  Scenario Outline: Renders each color variant with a countdown
    Given I mount the "timer-widget" component as "TimerWidget" with:
      | title       | Sale Ends In     |
      | target-date | 2099-12-31T23:59:59Z |
      | variant     | <variant>        |
    Then it should render without any page errors
    And it should contain 4 elements matching ".contentvidya-timer-block"
    And it should contain 1 elements matching ".contentvidya-timer-variant-<variant>"

    Examples:
      | variant |
      | dark    |
      | neon    |
      | gray    |

  Scenario: Renders the expired message once the target date has passed
    Given I mount the "timer-widget" component as "TimerWidget" with:
      | title        | Sale Ends In           |
      | target-date  | 2000-01-01T00:00:00Z   |
      | expired-text | This sale has ended    |
    Then it should render without any page errors
    And the component text should include "This sale has ended"
    And it should contain 0 elements matching ".contentvidya-timer-block"
    And the component should have no serious accessibility violations

  Scenario: Renders a background image with overlay scrim
    Given I mount the "timer-widget" component as "TimerWidget" with:
      | title               | Sale Ends In                     |
      | target-date         | 2099-12-31T23:59:59Z              |
      | background-image-url | /docs/assets/images/summer_sale.png |
      | overlay             | rgba(0, 0, 0, 0.45)               |
      | height              | 320px                              |
    Then it should render without any page errors
    And the component should contain a visible ".contentvidya-timer-overlay" element

  Scenario Outline: Renders every background effect and animates
    Given I mount the "timer-widget" component as "TimerWidget" with:
      | title            | Sale Ends In          |
      | target-date      | 2099-12-31T23:59:59Z  |
      | background-effect | <effect>             |
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
