Feature: RichTextEditor
  As a consumer of @chronos-ui/core
  I want the RichTextEditor web component to render its toolbar and editable content
  So that content authors can format text, insert media, and see it reflected immediately

  Scenario: Renders initial content and the configured toolbar
    Given I mount the "rich-text-editor" component as "RichTextEditor" with:
      | initial-content | <p>Hello editor</p>                                      |
      | config          | {"toolbar":["bold","italic","image","video"]}            |
    Then it should render without any page errors
    And the component should contain a visible ".wysiwyg-content" element
    And the component text should include "Hello editor"
    And the component should contain a visible "button[title='Bold']" element
    And the component should contain a visible "button[title='Image']" element
    And the component should contain a visible "button[title='Video']" element
    And the component should have no serious accessibility violations

  Scenario: Inserting an image via the prompt fallback lands in the content
    Given I mount the "rich-text-editor" component as "RichTextEditor" with:
      | initial-content | <p>Start typing here</p>                       |
      | config          | {"toolbar":["image"]}                          |
    And I will answer any prompt dialog with "https://example.com/photo.jpg"
    When I click into the editable content
    And I click the toolbar button titled "Image"
    Then it should render without any page errors
    And it should contain 1 elements matching "img[src='https://example.com/photo.jpg']"

  Scenario: Inserting a video via the prompt fallback lands in the content
    Given I mount the "rich-text-editor" component as "RichTextEditor" with:
      | initial-content | <p>Start typing here</p>                       |
      | config          | {"toolbar":["video"]}                          |
    And I will answer any prompt dialog with "https://example.com/clip.mp4"
    When I click into the editable content
    And I click the toolbar button titled "Video"
    Then it should render without any page errors
    And it should contain 1 elements matching "video[src='https://example.com/clip.mp4']"
