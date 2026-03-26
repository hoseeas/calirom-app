import { ExternalLink } from 'lucide-react'
import EnumTag from './EnumTag'

type EnumOption = {
  id: string
  name: string
  color: string
}

type CustomFieldValue = {
  textValue?: string | null
  numberValue?: number | null
  booleanValue?: boolean | null
  enumOptionId?: string | null
  enumOption?: EnumOption | null
  fieldDefinition?: {
    fieldType: string
  } | null
}

type CustomFieldCellProps = {
  fieldType: string
  value: CustomFieldValue | null | undefined
}

export default function CustomFieldCell({ fieldType, value }: CustomFieldCellProps) {
  if (!value) {
    return <span className="text-gray-300">—</span>
  }

  switch (fieldType) {
    case 'ENUM': {
      if (!value.enumOption) {
        return <span className="text-gray-300">—</span>
      }
      return (
        <EnumTag
          color={value.enumOption.color}
          label={value.enumOption.name}
        />
      )
    }

    case 'TEXT': {
      if (!value.textValue) return <span className="text-gray-300">—</span>
      return (
        <span className="text-sm text-gray-700 truncate max-w-[120px]">
          {value.textValue}
        </span>
      )
    }

    case 'URL': {
      if (!value.textValue) return <span className="text-gray-300">—</span>
      return (
        <a
          href={value.textValue}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[100px]">Link</span>
        </a>
      )
    }

    case 'NUMBER': {
      if (value.numberValue === null || value.numberValue === undefined) {
        return <span className="text-gray-300">—</span>
      }
      return (
        <span className="text-sm text-gray-700 tabular-nums">
          {value.numberValue}
        </span>
      )
    }

    case 'CHECKBOX': {
      if (value.booleanValue === null || value.booleanValue === undefined) {
        return <span className="text-gray-300">—</span>
      }
      return (
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded border text-xs ${
            value.booleanValue
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-gray-300 bg-white'
          }`}
        >
          {value.booleanValue && '✓'}
        </span>
      )
    }

    default:
      return <span className="text-gray-300">—</span>
  }
}
