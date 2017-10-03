/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeRegExp} from '@angular/compiler/src/util';

import {serializeNodes} from '../../../src/i18n/digest';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {Xliff2} from '../../../src/i18n/serializers/xliff2';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<!-- i18n -->{ count, plural, =0 {<p>test</p>}}<!-- /i18n -->
<p i18n="m|d@@i">foo</p>
<p i18n="nested"><b><u>{{interpolation}} Text</u></b></p>
<p i18n="ph names"><br><img src="1.jpg"><img src="2.jpg"></p>
<p i18n="empty element">hello <span></span></p>
<p i18n="@@baz">{ count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }}</p>
<p i18n>{ count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }}</p>
`;

const WRITE_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="1933478729560469763">
      <segment>
        <source>translatable attribute</source>
      </segment>
    </unit>
    <unit id="7056919470098446707">
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
      </segment>
    </unit>
    <unit id="2981514368455622387">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
      </segment>
    </unit>
    <unit id="i">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
      </notes>
      <segment>
        <source>foo</source>
      </segment>
    </unit>
    <unit id="6440235004920703622">
      <notes>
        <note category="description">nested</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/> Text</pc></pc></source>
      </segment>
    </unit>
    <unit id="8779402634269838862">
      <notes>
        <note category="description">ph names</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/></source>
      </segment>
    </unit>
    <unit id="6536355551500405293">
      <notes>
        <note category="description">empty element</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc></source>
      </segment>
    </unit>
    <unit id="baz">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
      </segment>
    </unit>
    <unit id="2015957479576096115">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
      </segment>
    </unit>
  </file>
</xliff>
`;

const LOAD_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
  <file original="ng.template" id="ngi18n">
    <unit id="1933478729560469763">
      <segment>
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
      </segment>
    </unit>
    <unit id="7056919470098446707">
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc> tnemele elbatalsnart</target>
      </segment>
    </unit>
    <unit id="2981514368455622387">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">TEST</pc>} }</target>
      </segment>
    </unit>
    <unit id="i">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
      </notes>
      <segment>
        <source>foo</source>
        <target>oof</target>
      </segment>
    </unit>
    <unit id="6440235004920703622">
      <notes>
        <note category="description">nested</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/> Text</pc></pc></source>
        <target><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;">txeT <ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/></pc></pc></target>
      </segment>
    </unit>
    <unit id="8779402634269838862">
      <notes>
        <note category="description">ph names</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/></source>
        <target><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/></target>
      </segment>
    </unit>
    <unit id="6536355551500405293">
      <notes>
        <note category="description">empty element</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc></source>
        <target><pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc> olleh</target>
      </segment>
    </unit>
    <unit id="baz">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } }</target>
      </segment>
    </unit>
    <unit id="2015957479576096115">
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } }</target>
      </segment>
    </unit>
  </file>
</xliff>
`;

export function main(): void {
  const serializer = new Xliff2();

  function toXliff(html: string, locale: string | null = null): string {
    const catalog = new MessageBundle(new HtmlParser, [], {}, locale);
    catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsMap(xliff: string): {[id: string]: string} {
    const {i18nNodesByMsgId} = serializer.load(xliff, 'url');

    const msgMap: {[id: string]: string} = {};
    Object.keys(i18nNodesByMsgId)
        .forEach(id => msgMap[id] = serializeNodes(i18nNodesByMsgId[id]).join(''));

    return msgMap;
  }

  describe('XLIFF 2.0 serializer', () => {
    describe('write', () => {
      it('should write a valid xliff 2.0 file',
         () => { expect(toXliff(HTML)).toEqual(WRITE_XLIFF); });
      it('should write a valid xliff 2.0 file with a source language',
         () => { expect(toXliff(HTML, 'fr')).toContain('srcLang="fr"'); });
    });

    describe('load', () => {
      it('should load XLIFF files', () => {
        expect(loadAsMap(LOAD_XLIFF)).toEqual({
          '1933478729560469763': 'etubirtta elbatalsnart',
          '7056919470098446707':
              '<ph name="INTERPOLATION"/> <ph name="START_BOLD_TEXT"/>sredlohecalp htiw<ph name="CLOSE_BOLD_TEXT"/> tnemele elbatalsnart',
          '2981514368455622387':
              '{VAR_PLURAL, plural, =0 {[<ph name="START_PARAGRAPH"/>, TEST, <ph name="CLOSE_PARAGRAPH"/>]}}',
          'i': 'oof',
          '6440235004920703622':
              '<ph name="START_BOLD_TEXT"/><ph name="START_UNDERLINED_TEXT"/>txeT <ph name="INTERPOLATION"/><ph name="CLOSE_UNDERLINED_TEXT"/><ph name="CLOSE_BOLD_TEXT"/>',
          '8779402634269838862':
              '<ph name="TAG_IMG_1"/><ph name="TAG_IMG"/><ph name="LINE_BREAK"/>',
          '6536355551500405293': '<ph name="START_TAG_SPAN"/><ph name="CLOSE_TAG_SPAN"/> olleh',
          'baz':
              '{VAR_PLURAL, plural, =0 {[{VAR_SELECT, select, other {[<ph name="START_PARAGRAPH"/>, profondément imbriqué, <ph name="CLOSE_PARAGRAPH"/>]}},  ]}}',
          '2015957479576096115':
              '{VAR_PLURAL, plural, =0 {[{VAR_SELECT, select, other {[<ph name="START_PARAGRAPH"/>, profondément imbriqué, <ph name="CLOSE_PARAGRAPH"/>]}},  ]}}'
        });
      });

      it('should return the target locale',
         () => { expect(serializer.load(LOAD_XLIFF, 'url').locale).toEqual('fr'); });
    });

    describe('structure errors', () => {
      it('should throw when a wrong xliff version is used', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="deadbeef">
        <source/>
        <target/>
      </trans-unit>
    </body>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/The XLIFF file version 1.2 is not compatible with XLIFF 2.0 serializer/);
      });

      it('should throw when an unit has no translation', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="missingtarget">
      <segment>
        <source/>
      </segment>
    </unit>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/Message missingtarget misses a translation/);
      });


      it('should throw when an unit has no id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit>
      <segment>
        <source/>
        <target/>
      </segment>
    </unit>
  </file>
</xliff>`;

        expect(() => { loadAsMap(XLIFF); }).toThrowError(/<unit> misses the "id" attribute/);
      });

      it('should throw on duplicate unit id', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="deadbeef">
      <segment>
        <source/>
        <target/>
      </segment>
    </unit>
    <unit id="deadbeef">
      <segment>
        <source/>
        <target/>
      </segment>
    </unit>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(/Duplicated translations for msg deadbeef/);
      });
    });

    describe('message errors', () => {
      it('should throw on unknown message tags', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="deadbeef">
      <segment>
        <source/>
        <target><b>msg should contain only ph and pc tags</b></target>
      </segment>
    </unit>
  </file>
</xliff>`;

        expect(() => { loadAsMap(XLIFF); })
            .toThrowError(new RegExp(
                escapeRegExp(`[ERROR ->]<b>msg should contain only ph and pc tags</b>`)));
      });

      it('should throw when a placeholder misses an id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="deadbeef">
      <segment>
        <source/>
        <target><ph/></target>
      </segment>
    </unit>
  </file>
</xliff>`;

        expect(() => {
          loadAsMap(XLIFF);
        }).toThrowError(new RegExp(escapeRegExp(`<ph> misses the "equiv" attribute`)));
      });
    });
  });
}