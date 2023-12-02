Imports Microsoft.VisualBasic.Net.Protocols.Reflection

Public Module TcpProtocols

    Public ReadOnly lpProtocol As Long = ProtocolAttribute.GetProtocolCategory(GetType(Protocols)).EntryPoint

End Module
