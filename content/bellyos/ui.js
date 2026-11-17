Docs.page({
  project: 'bellyos', section: 'ui', id: 'xml-layout', order: 1, title: 'XML layouts',
  summary: 'The elements of the interface and the attributes that shape them.',
  blocks: [
    D.lead('An application describes its screens in XML files under `res/layout/`. Nobody computes coordinates: containers place their children, and a `Scene` turns the description into live elements.'),
    D.code('xml', `
      <Column width="fill" height="fill" pad="16" gap="12">
          <Text style="title" text="Settings"/>
          <Card>
              <Row gap="8" align="center">
                  <Text text="Dark mode" width="fill"/>
                  <Switch id="dark"/>
              </Row>
          </Card>
          <Spacer/>
          <Tap id="save" style="primary" text="Save"/>
      </Column>`, 'res/layout/main.xml'),
    D.h2('Elements'),
    D.table(['Element', 'What it is'], [
      ['`Column`, `Row`', 'Place children one below the other or side by side.'],
      ['`Card`', 'A column with the look of a card: surface color, border, rounded corners.'],
      ['`Grid`', 'Children in equal columns (`cols`); a child may take several (`span`).'],
      ['`Scroll`', 'One child taller than the box, scrolled by dragging.'],
      ['`Rows`', 'A scrolling list of equal rows. Its single child is the row template, filled by an `Adapter`.'],
      ['`Text`', 'A line of text.'],
      ['`Tap`', 'A button with `text` and/or `glyph`.'],
      ['`Glyph`', 'A vector icon; `glyph` names it.'],
      ['`Switch`', 'An on/off switch.'],
      ['`Meter`', 'A progress bar (`percent`).'],
      ['`Rule`', 'A thin dividing line.'],
      ['`Spacer`', 'Empty space. Give it a `weight` to push neighbours apart.'],
      ['`Field`', 'A one-line text input.'],
      ['`Dot`', 'A round color choice with a ring when `checked`.'],
      ['`Swatch`', 'A rectangular choice, solid or gradient, with an accent border when `checked`.'],
      ['`Paint`', 'An area the program draws itself with a `Painter`; it also receives touches.']
    ]),
    D.note('`Scroll` and `Rows` scroll one at a time: do not nest them.'),
    D.h2('Attributes'),
    D.p('All attributes are optional. Sizes are in pixels.'),
    D.h3('Identity and size'),
    D.table(['Attribute', 'Values', 'Meaning'], [
      ['`id`', 'text', 'Name used by the program to find the element.'],
      ['`width`, `height`', '`fit` | `fill` | number', '`fit` is the size of the content (default). `fill` takes what the parent leaves; along the direction of a Column or Row it is a share of the free space. A number is a fixed size.'],
      ['`weight`', 'number', 'Share of the free space along the container\'s direction. Default `1` for `fill`.'],
      ['`visible`', '`true` | `false`', '`false` removes the element and its space.'],
      ['`enabled`', '`true` | `false`', 'Whether the control reacts to touches.']
    ]),
    D.h3('Spacing'),
    D.table(['Attribute', 'Meaning'], [
      ['`margin`, `marginX`, `marginY`, `marginLeft`, `marginTop`, `marginRight`, `marginBottom`', 'Space around the element.'],
      ['`pad`, `padX`, `padY`, `padLeft`, `padTop`, `padRight`, `padBottom`', 'Space inside it.'],
      ['`gap`', 'Space between the children of a container.']
    ]),
    D.h3('Placement'),
    D.table(['Attribute', 'Values', 'Meaning'], [
      ['`align`', '`start` | `center` | `end`', 'Containers: where children sit across the direction. Text and Tap: where the text sits.'],
      ['`pack`', '`start` | `center` | `end` | `between`', 'Containers: what to do with free space along the direction.'],
      ['`cols`, `span`', 'numbers', 'Grid columns, and how many a child occupies.'],
      ['`itemHeight`', 'number', 'Height of a row in `Rows`.'],
      ['`tap`', '`true`', 'Makes a container respond to touches.']
    ]),
    D.h3('Content and look'),
    D.table(['Attribute', 'Values', 'Meaning'], [
      ['`text`, `hint`', 'text', 'Content, and the placeholder of a Field.'],
      ['`glyph`', 'icon name', 'Which vector icon to draw. See the [icon list](doc:styles).'],
      ['`size`', 'number', 'Text height, icon size or dot diameter.'],
      ['`face`', '`regular` | `bold` | `italic` | `bolditalic`', 'Type style.'],
      ['`mono`', '`true`', 'Monospaced font.'],
      ['`ink`, `fill`, `border`', 'color', 'Text/icon color, background and border color.'],
      ['`fill2`', 'color', 'With `fill`: a vertical gradient from `fill` to `fill2`.'],
      ['`borderWidth`, `radius`, `shadow`', 'numbers', 'Border, corner rounding and shadow.'],
      ['`checked`, `percent`', 'bool, 0 to 100', 'State of Switch, Dot, Swatch and Meter.'],
      ['`style`', 'style name', 'Takes attributes from a style sheet. See [Styles and colors](doc:styles).']
    ]),
    D.h2('Errors'),
    D.p('A malformed layout fails with the file name and line, for example `layout/main.xml:12: ...`. The reader supports elements, attributes in single or double quotes, comments, the `<?xml ?>` prolog and the five predefined entities. DOCTYPE and CDATA are refused.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'ui', id: 'styles', order: 2, title: 'Styles and colors',
  summary: 'Style sheets, theme tokens, mixed colors and the built-in icons.',
  blocks: [
    D.p('A **style** is a set of attributes that elements take over. The framework brings a base sheet; an application adds its own in `res/values/styles.xml` on top of it.'),
    D.code('xml', `
      <Styles>
          <Style name="Tap" radius="14"/>
          <Style name="warning" parent="primary" fill="@warn"/>
      </Styles>`, 'res/values/styles.xml'),
    D.ul([
      'A style named like an element (`Tap`) applies to every such element.',
      'Any other style is used by name: `<Tap style="warning"/>`.',
      '`parent` names a style to start from.',
      'A later definition of a name changes only the attributes it mentions.'
    ]),
    D.h2('Base styles'),
    D.table(['Style', 'Effect'], [
      ['`primary`', 'Accent fill with the matching ink color.'],
      ['`danger`', 'Danger fill with white ink.'],
      ['`flat`', 'No fill, accent ink.'],
      ['`raised`', 'Raised surface fill.'],
      ['`title`', 'Size 22, bold.'],
      ['`heading`', 'Size 18, bold.'],
      ['`caption`', 'Size 12, bold, dim ink.'],
      ['`dim`', 'Dim ink.']
    ]),
    D.h2('Colors'),
    D.p('A color in an attribute is written as:'),
    D.table(['Form', 'Example', 'Meaning'], [
      ['`#rrggbb`, `#aarrggbb`', '`#ff8800`', 'Fixed color, optionally with alpha.'],
      ['`none`', '`none`', 'Transparent.'],
      ['`@token`', '`@accent`', 'A color of the current theme. It follows the accent color and light or dark mode.'],
      ['`mix:<a>:<b>:<percent>`', '`mix:@surface:@accent:35`', 'The first color blended towards the second.']
    ]),
    D.h3('Theme tokens'),
    D.table(['Token', 'Use'], [
      ['`@bg`', 'Window background.'], ['`@surface`', 'Cards and panels.'], ['`@surfaceHigh`', 'Raised controls.'],
      ['`@border`', 'Outlines.'], ['`@text`', 'Main text.'], ['`@dim`', 'Secondary text.'],
      ['`@accent`', 'The user\'s accent color.'], ['`@accentDim`', 'A quieter accent.'], ['`@onAccent`', 'Text on top of the accent.'],
      ['`@danger`, `@warn`, `@ok`', 'Status colors.'], ['`@shadow`, `@scrim`', 'Shadows and overlays.']
    ]),
    D.p('The accent, the light or dark mode and the other look-and-feel choices come from the [settings](doc:settings-service). When they change, every window receives a `theme` event and repaints.'),
    D.h2('Icons'),
    D.p('`glyph` names a built-in vector icon:'),
    D.p('`apps`, `back`, `calc`, `chart`, `check`, `chevron`, `clock`, `close`, `file`, `folder`, `gear`, `logout`, `maximize`, `minimize`, `monitor`, `note`, `palette`, `plus`, `power`, `reboot`, `restore`, `rotate`, `save`, `terminal`, `trash`, `up`, `user`.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'ui', id: 'scene', order: 3, title: 'Scene and events',
  summary: 'Bringing a layout to life: finding elements, reacting to taps, lists and custom drawing.',
  blocks: [
    D.lead('`Scenes.open` loads a layout, applies the styles and returns a `Scene`. The scene lays out the tree whenever something changed, draws it, presents the window and turns touches into taps, drags and presses.'),
    D.code('hasm', `
      self.scene = Scenes.open(win, handoff, "main", self)    // res/layout/main.xml`),
    D.p('Your program does three things: forward events and drawing to the scene, react in `Listener.act`, and change elements through the setters.'),
    D.code('hasm', `
      override func bool handle(map<string, any> e) { return self.scene.handle(e) }
      override func void draw() { self.scene.draw() }

      override func void act(string id, int index) {
          if id == "save" { self.scene.setText("status", "Saved") }
      }`),
    D.h2('The Listener'),
    D.table(['Method', 'Called when'], [
      ['`act(id, index)`', 'A control is activated: a Tap pressed, a Switch flipped, a Dot or Swatch chosen, a tappable container touched, Enter pressed in a Field. `index` is the row of a `Rows` list the control sits in, otherwise `-1`.'],
      ['`key(code)`', 'A key arrived and no Field wanted it. Return `true` to repaint.'],
      ['`typed(text)`', 'Text arrived and no Field wanted it. Return `true` to repaint.']
    ]),
    D.h2('Changing elements'),
    D.table(['Method', 'Effect'], [
      ['`setText(id, text)`, `textOf(id)`', 'Text of an element or the content of a Field.'],
      ['`setChecked(id, on)`, `isChecked(id)`', 'State of a Switch, Dot or Swatch.'],
      ['`setEnabled(id, on)`, `setVisible(id, on)`', 'Enable or show an element.'],
      ['`setPercent(id, percent)`', 'Value of a Meter.'],
      ['`set(id, key, value)`', 'Any attribute by name.'],
      ['`focusOn(id)`, `blur()`', 'Move the keyboard to a Field or remove it.'],
      ['`scrollToTop(id)`', 'Scroll a Scroll or Rows to the start.'],
      ['`find(id)`, `need(id)`', 'The element, or `null`; `need` throws when it is missing.'],
      ['`invalidate()`', 'Ask for a new layout and repaint after changing data you hold yourself.']
    ]),
    D.p('A setter marks the scene as changed. Return `true` from `handle` when the event changed something so the window repaints.'),
    D.h2('Lists'),
    D.p('A `Rows` element shows a list. Its single child is the **template** of a row. Provide an `Adapter` that says how many rows there are and fills each one:'),
    D.code('xml', `
      <Rows id="names" itemHeight="48">
          <Row pad="8" align="center">
              <Text id="name"/>
          </Row>
      </Rows>`, 'res/layout/lists.xml'),
    D.code('hasm', `
      class Names implement Adapter {
          list<string> items = []

          override func int count() { return ListApi.size(self.items) }

          override func void bind(int index, View row) {
              View label = row.find("name")
              label.text = self.items[index]
          }
      }

      // in begin():
      self.scene.setAdapter("names", self.names)`),
    D.p('Controls inside a row report the row number in `act(id, index)`.'),
    D.h2('Custom drawing'),
    D.p('A `Paint` element is a box that your program draws itself. Implement `Painter`: `paint` draws into the box, `touch` receives touches relative to it.'),
    D.code('hasm', `
      class Board implement Painter {
          int dots = 0

          override func void paint(Canvas c, Theme t, int x, int y, int w, int h) {
              c.fillRoundRect(x, y, w, h, 12, t.surface)
              c.fillCircle(x + w / 2, y + h / 2, 10 + self.dots, t.accent)
          }

          override func bool touch(string phase, int x, int y) {
              if phase == "down" { self.dots += 4 }
              return phase == "down"
          }
      }

      // in begin():
      self.scene.setPainter("board", self.board)`),
    D.p('Everything drawn is clipped to the box. See the [Canvas reference](doc:api-canvas) for the drawing functions.'),
    D.h2('Without XML'),
    D.p('Programs that prefer drawing everything themselves can use `Gui.open` to get a `Window` and the `Canvas` functions directly; `belly.Ui` offers a theme, button drawing helpers and icons for that style.')
  ]
});
