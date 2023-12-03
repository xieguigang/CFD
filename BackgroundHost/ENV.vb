Public Module ENV

    Public ReadOnly Property developmentEnv As Boolean

    Sub New()
        ' check is development enviromnnet via directory structures
        developmentEnv = True
    End Sub

End Module
