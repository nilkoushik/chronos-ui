Feature: WysiwygRenderer
  As a consumer of @chronos-ui/core
  I want the WysiwygRenderer web component to safely render rich HTML content
  So that CMS-authored content displays with scoped typography

  Scenario: Renders semantic HTML content
    Given I mount the "wysiwyg-renderer" component as "WysiwygRenderer" with:
      | html-content | <h2>Premium Editorial Layout</h2><p>Some <strong>bold</strong> and <em>italic</em> text.</p> |
    Then it should render without any page errors
    And the component should contain a visible "h2" element
    And the component text should include "Premium Editorial Layout"
    And it should contain 1 elements matching "strong"
    And it should contain 1 elements matching "em"
    And the component should have no serious accessibility violations

  Scenario: Renders a social embed placeholder without throwing
    Given I mount the "wysiwyg-renderer" component as "WysiwygRenderer" with:
      | html-content | <div class="chronos-social-embed" data-platform="youtube" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div> |
    Then it should render without any page errors
