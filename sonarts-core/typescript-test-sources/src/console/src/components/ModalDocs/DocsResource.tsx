import * as React from 'react'
import {Resource} from './ModalDocs'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {$v} from 'graphcool-styles'

interface Props {
  resource: Resource
}

const sources = {
  guide: require('graphcool-styles/icons/fill/docsTutorial.svg'),
  example: require('graphcool-styles/icons/fill/docsExample.svg'),
  faq: require('graphcool-styles/icons/fill/docsQuestion.svg'),
  article: require('graphcool-styles/icons/fill/docsArticle.svg'),
}

const colors = {
  guide: $v.purple,
  example: $v.lightOrange,
  faq: $v.blue,
  article: $v.blue,
}

const DocsResource = ({resource}: Props) => {
  return (
    <a className='docs-resource' href={resource.link} target='_blank'>
      <style jsx={true}>{`
        .docs-resource {
          @p: .relative, .flex, .itemsStart, .mt10;
        }
        .docs-resource:hover .title {
          @p: .black60;
        }
        .docs-resource:hover .type {
          @p: .black40;
        }
        .featureIcon {
          @p: .relative, .mr10;
          top: 2px;

          &:before {
            content: '';
            @p: .absolute, .left50, .top50, .tlCenter, .wS20, .hS20, .brPill;
          }

          &.guide {
            &:before {
              @p: .bgPurple20;
            }
          }
          &.example {
            &:before {
              @p: .bgLightOrange20;
            }
          }
          &.faq {
            &:before {
              @p: .bgBlue20;
            }
          }
          &.article {
            &:before {
              @p: .bgBlue20;
            }
          }
        }
        .title {
          @p: .black50, .f20;
        }
        .type {
          @p: .f12, .black30, .ttu, .fw6;
        }
      `}</style>
      <div className={'featureIcon ' + resource.type}>
        <Icon
          src={sources[resource.type]}
          height={25}
          width={25}
          color={colors[resource.type]}
        />
      </div>
      <div>
        <div className='title'>{resource.title}</div>
        <div className='type'>{resource.type}</div>
      </div>
    </a>
  )
}

export default DocsResource
