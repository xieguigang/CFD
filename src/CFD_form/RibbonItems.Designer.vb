'------------------------------------------------------------------------------
' <auto-generated>
'     This code was generated by a tool.
'     Runtime Version:
'
'     Changes to this file may cause incorrect behavior and will be lost if
'     the code is regenerated.
' </auto-generated>
'------------------------------------------------------------------------------

Imports System
Imports RibbonLib
Imports RibbonLib.Controls
Imports RibbonLib.Interop

Namespace RibbonLib.Controls
    Partial Class RibbonItems
        Private Class Cmd
            Public Const cmdTabPage As UInteger = 3
            Public Const cmdCommandGroup As UInteger = 4
            Public Const cmdCommandPanel As UInteger = 5
            Public Const cmdButtonReset As UInteger = 2
        End Class

        ' ContextPopup CommandName

        Private _ribbon As Ribbon
        Public ReadOnly Property Ribbon As Ribbon
            Get
                Return _ribbon
            End Get
        End Property
        Private _TabPage As RibbonTabGroup
        Public ReadOnly Property TabPage As RibbonTabGroup
            Get
                Return _TabPage
            End Get
        End Property
        Private _CommandGroup As RibbonTab
        Public ReadOnly Property CommandGroup As RibbonTab
            Get
                Return _CommandGroup
            End Get
        End Property
        Private _CommandPanel As RibbonGroup
        Public ReadOnly Property CommandPanel As RibbonGroup
            Get
                Return _CommandPanel
            End Get
        End Property
        Private _ButtonReset As RibbonButton
        Public ReadOnly Property ButtonReset As RibbonButton
            Get
                Return _ButtonReset
            End Get
        End Property

        Public Sub New(ByVal ribbon As Ribbon)
            If ribbon Is Nothing Then
                Throw New ArgumentNullException(NameOf(ribbon), "Parameter is Nothing")
            End If
            _ribbon = ribbon
            _TabPage = New RibbonTabGroup(_ribbon, Cmd.cmdTabPage)
            _CommandGroup = New RibbonTab(_ribbon, Cmd.cmdCommandGroup)
            _CommandPanel = New RibbonGroup(_ribbon, Cmd.cmdCommandPanel)
            _ButtonReset = New RibbonButton(_ribbon, Cmd.cmdButtonReset)
        End Sub

    End Class
End Namespace
