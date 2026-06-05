import { useStyle } from '@builder.io/mitosis';

export default function Test() {
  useStyle(`
    .test { color: red; }
  `);
  return <div class="test">Hello</div>;
}
